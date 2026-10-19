#!/usr/bin/env node
// ─────────────────────────────────────────────────────────────
// 阿里云 API 服务（Node 22，零框架依赖）
//
// 作用：把 functions/api/* 那套 Cloudflare Pages Functions 原样跑在 Node 上，
// 让「迁到境内服务器」不必重写任何业务逻辑。
//
// 架构（与 nginx 分工）：
//   nginx    → 静态文件 dist/、gzip、CSP、301（见 deploy/nginx.conf）
//   Node(本文件) → 仅 /api/*，监听 127.0.0.1:8787，由 nginx 反代
//   pm2      → 守护本进程，开机自启
//
// 为什么只监听 127.0.0.1：外网只能经 nginx 进来，Node 不直接暴露 8787，
// 少一个被打的入口。若本机调试需直连，临时设 HOST=0.0.0.0。
//
// 与 Cloudflare 版的差异只有两处：
//   1. waitUntil —— Node 里用一个 pending 集合实现，响应先发、通知后台跑；
//   2. env 来源 —— 从 .env 文件 / systemd 环境变量读，不再从 context.env 拿。
//
// 用法：node server/index.mjs
// ─────────────────────────────────────────────────────────────
import { createServer } from 'node:http';
import { existsSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';

const HERE = dirname(fileURLToPath(import.meta.url));

// ── 载入 .env（Node 20.12+ 内置 loadEnvFile，不需要 dotenv 包）──
// 已存在的 process.env 优先：systemd / pm2 注入的值不会被文件覆盖。
const envFile = process.env.ENV_FILE || resolve(HERE, '.env');
if (existsSync(envFile)) {
  try {
    process.loadEnvFile(envFile);
  } catch (err) {
    console.warn('[api] .env 读取失败：', err instanceof Error ? err.message : err);
  }
} else {
  console.warn(`[api] 未找到 ${envFile}，将只使用进程环境变量`);
}

const PORT = Number(process.env.PORT || 8787);
const HOST = process.env.HOST || '127.0.0.1';
const MAX_BODY = 1024 * 1024; // 1MB 硬上限，业务层还有各自更严的检查

// ── 后台任务（等价于 Cloudflare 的 waitUntil）──
// 响应发出后进程仍在，通知继续跑；优雅退出时等它们结束，避免丢飞书消息。
const pending = new Set();
const waitUntil = (promise) => {
  const p = Promise.resolve(promise).catch(() => {});
  pending.add(p);
  p.finally(() => pending.delete(p));
};

// ── 懒加载 handler：keystatic 依赖较重，不访问后台就不加载 ──
const loaders = {
  lead: () => import('./dist/lead.mjs'),
  event: () => import('./dist/event.mjs'),
  progress: () => import('./dist/progress.mjs'),
  adminProgress: () => import('./dist/admin-progress.mjs'),
  keystatic: () => import('./dist/keystatic.mjs'),
};
const cache = {};
async function handler(name) {
  if (!cache[name]) cache[name] = await loaders[name]();
  return cache[name];
}

// ── Node IncomingMessage → 标准 Request ──
async function toRequest(req) {
  const host = req.headers.host || `127.0.0.1:${PORT}`;
  const url = new URL(req.url || '/', `http://${host}`);

  const headers = new Headers();
  for (const [k, v] of Object.entries(req.headers)) {
    if (Array.isArray(v)) for (const item of v) headers.append(k, item);
    else if (v !== undefined) headers.set(k, v);
  }

  const method = (req.method || 'GET').toUpperCase();
  let body;
  if (method !== 'GET' && method !== 'HEAD') {
    const chunks = [];
    let size = 0;
    for await (const chunk of req) {
      size += chunk.length;
      if (size > MAX_BODY) throw Object.assign(new Error('body too large'), { code: 413 });
      chunks.push(chunk);
    }
    if (chunks.length) body = Buffer.concat(chunks);
  }

  return new Request(url, { method, headers, body });
}

// ── 标准 Response → Node ServerResponse ──
// Set-Cookie 必须用 getSetCookie() 逐条写，直接 forEach 会把多条压成一条
// （keystatic 登录态依赖这条，压扁后后台登录会随机掉线）。
async function send(res, response) {
  res.statusCode = response.status;
  let hasCookie = false;
  response.headers.forEach((value, key) => {
    if (key.toLowerCase() === 'set-cookie') {
      hasCookie = true;
      return;
    }
    res.setHeader(key, value);
  });
  if (hasCookie) res.setHeader('set-cookie', response.headers.getSetCookie());
  const buf = Buffer.from(await response.arrayBuffer());
  res.end(buf);
}

function json(res, status, payload) {
  res.writeHead(status, {
    'Content-Type': 'application/json; charset=utf-8',
    'Cache-Control': 'no-store',
    'X-Robots-Tag': 'noindex, nofollow',
  });
  res.end(JSON.stringify(payload));
}

// ── 路由表 ──
// 与 functions/ 的目录结构一一对应：路径对上就交给同名 handler。
// 全部用精确路径，不做前缀通配（/api/keystatic 除外，它本来就要吃子路径）。
const ROUTES = [
  { path: '/api/lead', mod: 'lead' },
  { path: '/api/event', mod: 'event' },
  { path: '/api/progress', mod: 'progress' },
  { path: '/api/admin/progress', mod: 'adminProgress' },
];

async function route(request) {
  const { pathname } = new URL(request.url);

  // 健康检查：不碰业务，只报「哪些密钥配了」，绝不回显值。
  // 部署后先打这个接口，一眼看出是不是漏配 FORMS_ACCESS_KEY。
  if (pathname === '/api/health') {
    const keys = [
      'FORMS_ACCESS_KEY',
      'ADMIN_ACCESS_KEY',
      'FEISHU_WEBHOOK_URL',
      'FEISHU_KEYWORD',
      'RESEND_API_KEY',
      'RESEND_TO_EMAIL',
      'KEYSTATIC_GITHUB_CLIENT_ID',
      'KEYSTATIC_GITHUB_CLIENT_SECRET',
      'KEYSTATIC_SECRET',
    ];
    const out = {};
    for (const k of keys) out[k] = Boolean(process.env[k]);
    return new Response(JSON.stringify({ ok: true, env: out, uptime: process.uptime() }), {
      status: 200,
      headers: { 'Content-Type': 'application/json; charset=utf-8', 'Cache-Control': 'no-store' },
    });
  }

  // Keystatic 后台：吃 /api/keystatic 及其所有子路径
  if (pathname === '/api/keystatic' || pathname.startsWith('/api/keystatic/')) {
    const mod = await handler('keystatic');
    return mod.onRequest({ request, env: process.env });
  }

  for (const r of ROUTES) {
    if (pathname !== r.path) continue;
    const mod = await handler(r.mod);
    const ctx = { request, env: process.env, waitUntil };

    if (request.method === 'OPTIONS' && mod.onRequestOptions) {
      return mod.onRequestOptions(ctx);
    }
    if (request.method === 'GET' && mod.onRequestGet) return mod.onRequestGet(ctx);
    if (request.method === 'POST' && mod.onRequestPost) return mod.onRequestPost(ctx);

    // 方法不支持时，用模块自己的 OPTIONS 头回 405，保持与 Cloudflare 一致
    if (mod.onRequestOptions) {
      const opt = await mod.onRequestOptions(ctx);
      const allow = opt.headers.get('allow') || '';
      return new Response(JSON.stringify({ ok: false, message: '方法不支持。' }), {
        status: 405,
        headers: {
          'Content-Type': 'application/json; charset=utf-8',
          'Cache-Control': 'no-store',
          Allow: allow,
        },
      });
    }
  }

  return null;
}

const server = createServer(async (req, res) => {
  const started = Date.now();
  const { pathname } = new URL(req.url || '/', 'http://x');

  try {
    // 非 /api/* 不走这里：nginx 已经处理静态文件，能到 Node 说明 nginx 配错了。
    if (!pathname.startsWith('/api/')) {
      res.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' });
      res.end('Not Found');
      return;
    }

    const request = await toRequest(req);
    const response = await route(request);

    if (!response) {
      json(res, 404, { ok: false, message: '接口不存在。' });
      return;
    }

    await send(res, response);
  } catch (err) {
    const code = err && typeof err === 'object' && 'code' in err ? err.code : null;
    if (code === 413) {
      json(res, 413, { ok: false, message: '提交内容过长。' });
      return;
    }
    console.error(`[api] 500 ${req.method} ${pathname}`, err);
    if (!res.headersSent) json(res, 500, { ok: false, message: '服务异常，请稍后再试。' });
    else res.end();
  } finally {
    const ms = Date.now() - started;
    // 只记方法、路径、耗时；不记 body（里面是客户姓名电话）
    console.log(`[api] ${res.statusCode} ${req.method} ${pathname} ${ms}ms`);
  }
});

server.listen(PORT, HOST, () => {
  console.log(`[api] 已启动 http://${HOST}:${PORT}`);
  console.log(`[api] 环境文件：${existsSync(envFile) ? envFile : '（未使用）'}`);
});

// ── 优雅退出：等后台通知跑完再走，避免 pm2 reload 时丢飞书消息 ──
let closing = false;
async function shutdown(signal) {
  if (closing) return;
  closing = true;
  console.log(`[api] 收到 ${signal}，关闭中…`);
  server.close();
  if (pending.size) {
    console.log(`[api] 等待 ${pending.size} 个后台任务…`);
    await Promise.allSettled([...pending]);
  }
  process.exit(0);
}
process.on('SIGTERM', () => shutdown('SIGTERM'));
process.on('SIGINT', () => shutdown('SIGINT'));
