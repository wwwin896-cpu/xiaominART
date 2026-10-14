#!/usr/bin/env node
// @ts-nocheck
/**
 * 作品编码自检（构建前跑）
 *
 * 校验 src/data/content.ts 里 readyMadeWorks 的 12 幅编码：
 *   1. 格式是否为七段式
 *   2. 校验位是否正确（用 code-registry 的 calcCheck 实算）
 *   3. 编码第 ④ 段年份是否与 year 字段一致
 *   4. 编码是否重复
 *
 * 用法：node scripts/check-codes.mjs
 * 这里刻意不 import TS，改为读源码文本 + 简版校验，避免依赖构建环境。
 */
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const SRC = join(__dirname, '..', 'src', 'data', 'content.ts');

const MOD_WEIGHTS = [1, 3, 7, 9, 5, 11, 13];

function lettersToDigits(s) {
  let out = '';
  for (const ch of s.toUpperCase()) {
    if (ch >= '0' && ch <= '9') out += ch;
    else if (ch >= 'A' && ch <= 'Z') out += String(ch.charCodeAt(0) - 64);
  }
  return out;
}

function calcCheck(body) {
  const digits = lettersToDigits(body.replace(/-/g, ''));
  let total = 0;
  for (let i = 0; i < digits.length; i++) total += Number(digits[i]) * MOD_WEIGHTS[i % MOD_WEIGHTS.length];
  return (10 - (total % 10)) % 10;
}

const text = readFileSync(SRC, 'utf8');

// 只在 readyMadeWorks 数组区间内匹配，避免误抓别的 code 字段
const startIdx = text.indexOf('export const readyMadeWorks');
const endIdx = text.indexOf('export const channelPages');
if (startIdx === -1 || endIdx === -1) {
  console.error('✗ 找不到 readyMadeWorks 数组区间，请检查 content.ts 结构');
  process.exit(1);
}
const region = text.slice(startIdx, endIdx);

const re = /slug:\s*'([^']+)'[\s\S]*?title:\s*'([^']+)'[\s\S]*?code:\s*'([^']+)'[\s\S]*?year:\s*(\d+)/g;

const issues = [];
const seen = new Map();
let count = 0;

let m;
while ((m = re.exec(region)) !== null) {
  const [, slug, title, code, yearStr] = m;
  const year = Number(yearStr);
  count++;

  const parts = code.split('-');
  if (parts.length !== 7) {
    issues.push(`${slug}（${title}）：编码不是 7 段 → ${code}`);
    continue;
  }
  if (parts[0] !== 'XMA') {
    issues.push(`${slug}（${title}）：品牌前缀不是 XMA → ${code}`);
  }
  const body = parts.slice(0, 6).join('-');
  const expected = calcCheck(body);
  if (Number(parts[6]) !== expected) {
    issues.push(`${slug}（${title}）：校验位错误 → ${code}（末位应为 ${expected}）`);
  }
  const codeYear = 2000 + Number(parts[3]);
  if (codeYear !== year) {
    issues.push(`${slug}（${title}）：编码年份段 ${codeYear} 与 year 字段 ${year} 不一致`);
  }
  if (seen.has(code)) {
    issues.push(`${slug}（${title}）：编码与 ${seen.get(code)} 重复 → ${code}`);
  }
  seen.set(code, slug);
}

console.log(`检查作品编码：共解析 ${count} 件`);

if (count === 0) {
  console.error('✗ 未解析到任何带 code 字段的作品——请确认 content.ts 已添加 code / year 字段');
  process.exit(1);
}

if (issues.length) {
  console.error(`\n✗ 发现 ${issues.length} 个编码问题：`);
  for (const i of issues) console.error(`   · ${i}`);
  process.exit(1);
}

console.log('✓ 全部编码格式、校验位、年份段均自洽');
