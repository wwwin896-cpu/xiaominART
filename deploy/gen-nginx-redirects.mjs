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

const out = `# ⚠️ 自动生成，勿手改 —— 源文件 public/_redirects
# 重新生成：node deploy/gen-nginx-redirects.mjs
# 共 ${rules.length} 条

${body}
`;

writeFileSync('deploy/redirects.conf', out, 'utf8');
console.log(`已生成 deploy/redirects.conf：${rules.length} 条 301`);
