#!/usr/bin/env node
// ─────────────────────────────────────────────────────────────
// IndexNow 主动推送（2026-11-14）
//
// IndexNow 是 Bing / Yandex / Seznam / Naver 共用的开放协议：一次 POST 即通知
// 参与方抓取，无需逐家注册、无 token、无配额门槛（百度不参与，百度走
// scripts/baidu-push.mjs 的准入密钥通道，两者互补）。
//
// 与 baidu-push.mjs 同构，复用同一套「进度文件去重」思路：
//   · 状态写入 .indexnow-pushed.json，只推「新页面」或「lastmod 变过的页面」
//   · 状态由 CI 自动提交回 main，跨运行不丢进度
//
// 为什么必须去重：IndexNow 协议要求只提交新增/更新的 URL，重复提交
// 同一批 URL 会被视为滥用，参与方可能直接忽略后续请求。
//
// 用法：
//   node scripts/indexnow-push.mjs            # 增量推送
//   node scripts/indexnow-push.mjs --dry-run  # 只打印，不发请求
//   node scripts/indexnow-push.mjs --all      # 忽略进度全量推（慎用）
//
// 密钥：public/<KEY>.txt（内容即 KEY 本身），随站点部署到根路径。
//       KEY 变更时必须同时替换 public 下的文件，否则校验失败（403）。
// ─────────────────────────────────────────────────────────────
import { readFileSync, writeFileSync, existsSync, readdirSync } from 'node:fs';

const SITE = 'https://xiaominart.com';
const HOST = 'xiaominart.com';
const ENDPOINT = 'https://api.indexnow.org/indexnow';
const STATE_FILE = '.indexnow-pushed.json';
const MAX_PER_REQUEST = 10000;

const argv = process.argv.slice(2);
const DRY = argv.includes('--dry-run');
const ALL = argv.includes('--all');

// 从 public/ 下自动发现 key 文件（32 位 hex 命名的 .txt），避免把 key 写死在代码里
function findKey() {
  const dir = 'public';
  const candidates = readdirSync(dir).filter((f) => /^[0-9a-f]{32}\.txt$/.test(f));
  if (!candidates.length) throw new Error('public/ 下找不到 IndexNow 密钥文件（32 位 hex .txt）');
  const file = candidates[0];
  return { key: file.replace(/\.txt$/, ''), keyLocation: `${SITE}/${file}` };
}

function readSitemap() {
  const xml = readFileSync('dist/sitemap.xml', 'utf8');
  return [...xml.matchAll(/<url><loc>([^<]+)<\/loc><lastmod>([^<]+)<\/lastmod><\/url>/g)].map(
    (m) => ({ url: m[1], lastmod: m[2] }),
  );
}

function loadState() {
  if (!existsSync(STATE_FILE)) return { version: 1, site: SITE, urls: {} };
  try {
    return JSON.parse(readFileSync(STATE_FILE, 'utf8'));
  } catch {
    return { version: 1, site: SITE, urls: {} };
  }
}

const { key, keyLocation } = findKey();
const all = readSitemap();
const state = loadState();

// 入队规则与 baidu-push 一致：没见过 → 推；lastmod 变新 → 推；否则跳过
const queue = ALL
  ? all
  : all.filter(({ url, lastmod }) => {
      const prev = state.urls[url];
      if (!prev) return true;
      return prev.lastmod !== lastmod;
    });

console.log(`IndexNow：sitemap ${all.length} 条，本次入队 ${queue.length} 条（key=${key.slice(0, 6)}…）`);
if (!queue.length) {
  console.log('无新增或变更 URL，跳过。');
  process.exit(0);
}

if (DRY) {
  queue.slice(0, 20).forEach((x) => console.log('  →', x.url));
  if (queue.length > 20) console.log(`  … 其余 ${queue.length - 20} 条`);
  process.exit(0);
}

let ok = 0;
for (let i = 0; i < queue.length; i += MAX_PER_REQUEST) {
  const batch = queue.slice(i, i + MAX_PER_REQUEST);
  const body = {
    host: HOST,
    key,
    keyLocation,
    urlList: batch.map((x) => x.url),
  };
  try {
    const res = await fetch(ENDPOINT, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json; charset=utf-8' },
      body: JSON.stringify(body),
    });
    // 200/202 = 已接收；其他状态码都视为失败（403 多为 key 不匹配）
    if (res.status === 200 || res.status === 202) {
      ok += batch.length;
      const today = new Date().toISOString().slice(0, 10);
      batch.forEach(({ url, lastmod }) => {
        state.urls[url] = { pushedAt: today, lastmod };
      });
      console.log(`  批次 ${Math.floor(i / MAX_PER_REQUEST) + 1}：${batch.length} 条 → ${res.status} 已接收`);
    } else {
      const text = await res.text().catch(() => '');
      console.log(`  批次 ${Math.floor(i / MAX_PER_REQUEST) + 1}：${batch.length} 条 → ${res.status} ${text.slice(0, 120)}`);
    }
  } catch (e) {
    console.log(`  批次失败：${String(e).slice(0, 120)}`);
  }
}

state.site = SITE;
state.updatedAt = new Date().toISOString();
writeFileSync(STATE_FILE, JSON.stringify(state, null, 2) + '\n', 'utf8');
console.log(`汇总：成功通知 ${ok} / ${queue.length} 条`);
