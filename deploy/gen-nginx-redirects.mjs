// ─────────────────────────────────────────────────────────────
// 从 public/_redirects 生成 nginx 301 规则
//
// 为什么用脚本而不是手抄：_redirects 有 70+ 条，手抄必漏；
// 而且以后改了 _redirects，重跑一次就同步。**单一事实源 = public/_redirects**。
//
// 用法：node deploy/gen-nginx-redirects.mjs
// 产物：deploy/redirects.conf（由 nginx.conf include）
// ─────────────────────────────────────────────────────────────
import { readFileSync, writeFileSync } from 'node:fs';

const src = readFileSync('public/_redirects', 'utf8');

const rules = [];
const seen = new Set();
for (const rawLine of src.split(/\r?\n/)) {
  const line = rawLine.trim();
  if (!line || line.startsWith('#')) continue;

  const parts = line.split(/\s+/);
  if (parts.length < 3) continue;
  const [from, to, status] = parts;
  if (status !== '301') continue;

  // /blog/*  → ^/blog(/.*)?$   （前缀通配）
  // /x      → ^/x/?$            （精确路径，同时吃掉尾斜杠）
  let pattern;
  if (from.endsWith('/*')) {
    const prefix = from.slice(0, -2);
    pattern = `^${escapeRe(prefix)}(/.*)?$`;
  } else {
    pattern = `^${escapeRe(from.replace(/\/$/, ''))}/?$`;
  }

  // _redirects 里 `/x` 与 `/x/` 成对出现，转成 nginx 后是**完全相同**的正则
  // （都用 /?$ 吃掉尾斜杠），不去重会产生大量重复行。
  const key = `${pattern} -> ${to}`;
  if (seen.has(key)) continue;
  seen.add(key);

  rules.push({ from, to, pattern });
}

function escapeRe(s) {
  return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

const body = rules
  .map((r) => `rewrite ${r.pattern} ${r.to} permanent;  # ${r.from}`)
  .join('\n');

// ─────────────────────────────────────────────────────────────
// 主机归一：www → 裸域（2026-11-14 新增）
//
// 背景：www.xiaominart.com 与 xiaominart.com 同时返回 200，内容一模一样。
// 站内 canonical、sitemap、og:url、百度推送全部用裸域，www 是一套完整副本 ——
// 搜索引擎侧就是两套重复 URL：权重被分掉、收录量虚高、指标失真。
//
// 为什么写在这里而不是 nginx.conf：nginx.conf 在证书签发时被 certbot 改写过，
// 仓库里那份是过期模板（HTTP 跳转还注释着），CI 也不同步它 —— 覆盖会直接打挂
// HTTPS。而 redirects.conf 是 CI 每次部署都会安装并重载的那一个，且在 80/443
// 两个 server 块都被 include（实测 /shop 规则在两处宿主上都生效），
// 放在这里等于「版本控制 + 每次部署自动生效」。
//
// 用 server 级 if + return：这是 nginx 官方推荐的 host 重定向写法
// （https://nginx.org/en/docs/http/ngx_http_rewrite_module.html#server_name），
// 在 rewrite 阶段先于 location 执行，不会与 try_files 打架。
// 与既有的 http→https 拼成一条链：http://www → https://裸域（最多两跳，可接受）。
// ─────────────────────────────────────────────────────────────
const CANONICAL_HOST = 'xiaominart.com';
const hostBlock = `# 主机归一：www → 裸域（与 http→https 合成同一条 canonical 链）
if ($host = 'www.${CANONICAL_HOST}') {
    return 301 https://${CANONICAL_HOST}$request_uri;
}
`;

const out = `# ⚠️ 自动生成，勿手改 —— 源文件 public/_redirects
# 重新生成：node deploy/gen-nginx-redirects.mjs
# 共 ${rules.length} 条 301

${hostBlock}
${body}
`;

writeFileSync('deploy/redirects.conf', out, 'utf8');
console.log(`已生成 deploy/redirects.conf：${rules.length} 条 301 + 主机归一（www → ${CANONICAL_HOST}）`);
