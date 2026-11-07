#!/usr/bin/env node
// @ts-nocheck
/**
 * 文案体检（AI 味检测器）
 * 用法：node scripts/copy-lint.mjs [--top=20]
 *
 * 检测的是「AI 生成中文」的典型指纹，不是语法错误：
 *  1. 对偶套话：不只是…更是 / 不是…而是 / 让…成为
 *  2. 递归定义：A，是B；B，是C（「看见，是理解的开始」式）
 *  3. 万能升华：每一…都 / 从…到… / 在…之间
 *  4. 自问自答：问号开头的设问句
 *  5. 空转副词：渐渐地 / 悄悄地 / 缓缓地 / 仿佛 / 似乎
 *  6. 重复 CTA：同一页同一文案的按钮出现 ≥3 次
 */
import { readFileSync, readdirSync, statSync } from 'node:fs';
import { join } from 'node:path';

const ROOT = process.cwd();
const args = Object.fromEntries(
  process.argv.slice(2).map((a) => {
    const [k, v] = a.replace(/^--/, '').split('=');
    return [k, v ?? true];
  }),
);

const PATTERNS = [
  { id: 'not-only', label: '不只是…更是', re: /不只是[^。]{0,20}[，,]\s*更是/g },
  { id: 'not-but', label: '不是…而是', re: /不是[^。]{0,24}[，,]\s*而是/g },
  { id: 'let-become', label: '让…成为', re: /让[^。]{0,12}成为/g },
  { id: 'recursive-def', label: '递归定义 A是B；B是C', re: /[，,]\s*是[^。；;]{1,12}的开始[；;]|是[^。]{1,10}的入口/g },
  { id: 'every-all', label: '每一…都', re: /每一[^。]{0,10}都/g },
  { id: 'from-to', label: '从…到…（排比）', re: /从[^。]{2,14}[，,]\s*到[^。]{2,14}[，,]\s*到/g },
  { id: 'rhetorical', label: '设问句（？）', re: /？/g },
  { id: 'empty-adverb', label: '空转副词', re: /渐渐地|悄悄地|缓缓地|仿佛|似乎|不知不觉/g },
  { id: 'not-just', label: '不仅…还/也', re: /不仅[^。]{0,20}[，,]\s*(还|也)/g },
  { id: 'make-you', label: '让你/使你（推销腔）', re: /让(你|您)[^。]{0,12}(感受|体会|找到|拥有)/g },
  { id: 'wish', label: '愿…（祝愿腔）', re: /愿你/g },
  { id: 'here', label: '在这里', re: /在这里/g },
];

/** 递归收集 .astro / .ts 文件 */
function walk(dir, out = []) {
  for (const name of readdirSync(dir)) {
    const full = join(dir, name);
    const st = statSync(full);
    if (st.isDirectory()) {
      if (['node_modules', 'dist', '.git'].includes(name)) continue;
      walk(full, out);
    } else if (/\.(astro|ts)$/.test(name) && !name.endsWith('.d.ts')) out.push(full);
  }
  return out;
}

/** 只取人类可见文字：去掉 frontmatter 代码、脚本、样式、标签 */
function visibleText(src) {
  let s = src;
  s = s.replace(/^---[\s\S]*?---/m, ' ');
  s = s.replace(/<script[\s\S]*?<\/script>/g, ' ');
  s = s.replace(/<style[\s\S]*?<\/style>/g, ' ');
  s = s.replace(/\{\/\*[\s\S]*?\*\/\}/g, ' ');
  s = s.replace(/\/\*[\s\S]*?\*\//g, ' ');
  s = s.replace(/\/\/[^\n]*/g, ' ');
  s = s.replace(/<[^>]+>/g, ' ');
  return s;
}

const files = walk(join(ROOT, 'src'));
const rows = [];
let total = 0;

for (const f of files) {
  if (/page-faqs\.ts$/.test(f)) continue;
  let text = visibleText(readFileSync(f, 'utf8'));
  // 表单字段与 FAQ 条目的设问是功能性的，不算 AI 味
  text = text.replace(/question:[\s\S]{0,80}?[？?]/g, ' ');
  if (!/[\u4e00-\u9fa5]/.test(text)) continue;
  const hits = {};
  let score = 0;
  for (const p of PATTERNS) {
    const m = text.match(p.re);
    if (m) {
      hits[p.id] = m.length;
      score += m.length;
    }
  }
  if (score > 0) {
    rows.push({ file: f.replace(ROOT + '/', ''), score, hits });
    total += score;
  }
}

rows.sort((a, b) => b.score - a.score);
const top = Number(args.top ?? 15);
const label = Object.fromEntries(PATTERNS.map((p) => [p.id, p.label]));

console.log(`\n文案体检 · 扫描 ${files.length} 个文件，命中 ${rows.length} 个文件，合计 ${total} 处 AI 味指纹\n`);
for (const r of rows.slice(0, top)) {
  const detail = Object.entries(r.hits)
    .sort((a, b) => b[1] - a[1])
    .map(([k, v]) => `${label[k]}×${v}`)
    .join('，');
  console.log(`${String(r.score).padStart(3)}  ${r.file}\n     ${detail}`);
}
console.log('');
