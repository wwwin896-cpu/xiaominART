// 校验 public/llms.txt 中的站内链接在构建产物 dist/ 里真实存在。
// 背景：llms.txt 是给 AI 引擎的内容地图，出现 301 / 404 会让 AI 放弃引用
// （2026-10-28 实测 /blessings/ 与 /pricing-guide/ 均已 301，llms.txt 未同步）。
// 用法：npm run check:llms（在 build 之后跑，需要 dist/ 存在）。
import { readFileSync, existsSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const llmsPath = join(root, 'public', 'llms.txt');
const dist = join(root, 'dist');

const SITE = 'https://xiaominart.com';
const text = readFileSync(llmsPath, 'utf-8');
const links = [...new Set(text.match(/https:\/\/xiaominart\.com[^)\s，。）]*/g) ?? [])];

const bad = [];
for (const link of links) {
  let pathname;
  try {
    pathname = new URL(link).pathname;
  } catch {
    bad.push([link, '不是合法 URL']);
    continue;
  }
  // 功能页与接口不在 dist 内，llms.txt 已声明「不收录」，出现即报错
  if (/^\/(api|keystatic|admin)\b/.test(pathname)) {
    bad.push([link, '功能路径不应出现在 llms.txt']);
    continue;
  }
  const clean = pathname.replace(/\/+$/, '');
  const candidates = [
    join(dist, pathname, 'index.html'),
    join(dist, pathname),
    join(dist, `${clean}/index.html`),
    join(dist, `${clean}.html`),
  ];
  if (!candidates.some((p) => existsSync(p))) {
    bad.push([link, 'dist 中不存在对应页面']);
  }
}

if (bad.length) {
  console.error('✗ llms.txt 存在失效链接：');
  for (const [link, why] of bad) console.error(`  ${link} — ${why}`);
  process.exit(1);
}
console.log(`✓ llms.txt 校验通过：${links.length} 个站内链接全部可解析`);
