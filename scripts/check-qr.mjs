// @ts-nocheck
// ─────────────────────────────────────────────────────────────
// 二维码回归验证：确认 src/lib/qr.ts 生成的码真的能被扫出来。
//
// 为什么必须有这一步：
//   「SVG 生成成功」不等于「扫码器读得出来」。二维码的格式信息位序、掩码编号、
//   纠错分块交织只要错一处，图看着像二维码，但任何手机都扫不出 —— 而且本地
//   不会有任何报错。所以必须用**独立实现的解码器**回读比对。
//
// 用法：node scripts/check-qr.mjs
//   jsQR 与本实现零共享代码，是真正的外部裁判。
//   判定标准：所有用例 round-trip 完全一致，任一不符即 exit=1 阻断上线。
// ─────────────────────────────────────────────────────────────
import { createRequire } from 'node:module';
import { execFileSync } from 'node:child_process';
import { mkdirSync, existsSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const TMP = path.join(ROOT, '.qr-check');

// jsQR 优先从项目 node_modules 找，其次从 WorkBuddy 托管目录找
function loadJsQR() {
  const fileCandidates = [
    path.join(ROOT, 'node_modules', 'jsqr', 'dist', 'jsQR.js'),
    'C:/Users/andmi/.workbuddy/binaries/node/workspace/node_modules/jsqr/dist/jsQR.js',
  ];
  for (const f of fileCandidates) {
    if (!existsSync(f)) continue;
    try {
      return createRequire(import.meta.url)(f);
    } catch { /* 试下一个 */ }
  }
  try {
    return createRequire(import.meta.url)('jsqr');
  } catch { /* 试下一个 */ }
  try {
    const req = createRequire('file:///C:/Users/andmi/.workbuddy/binaries/node/workspace/');
    return req('jsqr');
  } catch { /* 放弃 */ }
  throw new Error('未找到 jsqr，请先安装：npm i -D jsqr');
}

const jsQR = loadJsQR();

// 1) 把 TS 转译成 ESM
if (!existsSync(TMP)) mkdirSync(TMP, { recursive: true });
const compiled = path.join(TMP, 'qr_compiled.mjs');
const localEsbuild = path.join(ROOT, 'node_modules', '.bin', 'esbuild');
const useLocal = existsSync(localEsbuild);
execFileSync(
  useLocal ? localEsbuild : 'npx',
  useLocal
    ? ['src/lib/qr.ts', '--format=esm', `--outfile=${compiled}`, '--log-level=warning']
    : ['esbuild', 'src/lib/qr.ts', '--format=esm', `--outfile=${compiled}`, '--log-level=warning'],
  { cwd: ROOT, stdio: 'inherit', shell: process.platform === 'win32' }
);

const qr = await import(`file://${compiled.replace(/\\/g, '/')}`);

// 2) 用例：覆盖短码、长 URL、带查询参数、中文 UTF-8
const CASES = [
  'XMA-CL-WA-26-0001-T2-0',
  'https://xiaominart.com/verify/',
  'https://xiaominart.com/verify/XMA-CL-WA-26-0001-T2-0/',
  'https://xiaominart.com/verify/XMA-CL-SG-26-0006-T1-3/',
  'https://xiaominart.com/verify/XMA-CL-WA-26-0001-T2-0/?s=certificate',
  '小民艺术 · 一物一码 · 扫码验真',
];

/** SVG → 模块矩阵（从 path 的 Mx y 命令反推黑模块坐标） */
function parseSvg(svg) {
  const vb = svg.match(/viewBox="0 0 (\d+) (\d+)"/);
  const total = Number(vb[1]);
  const body = svg.match(/<path d="([^"]*)"/)[1];
  const rects = body.match(/M(\d+) (\d+)h1v1h-1z/g) || [];
  const dark = new Set();
  for (const r of rects) {
    const q = r.match(/M(\d+) (\d+)/);
    dark.add(`${q[1]},${q[2]}`);
  }
  let minX = Infinity, minY = Infinity, maxX = -1, maxY = -1;
  for (const k of dark) {
    const [x, y] = k.split(',').map(Number);
    if (x < minX) minX = x;
    if (y < minY) minY = y;
    if (x > maxX) maxX = x;
    if (y > maxY) maxY = y;
  }
  return { dark, minX, minY, size: maxX - minX + 1, total };
}

/** 矩阵 → RGBA 像素（放大 scale 倍，四周补静区） */
function toImage(q, scale = 8, quiet = 4) {
  const n = q.size;
  const dim = (n + quiet * 2) * scale;
  const data = new Uint8ClampedArray(dim * dim * 4);
  for (let y = 0; y < dim; y++) {
    for (let x = 0; x < dim; x++) {
      const mr = Math.floor(y / scale) - quiet + q.minY;
      const mc = Math.floor(x / scale) - quiet + q.minX;
      const v = q.dark.has(`${mc},${mr}`) ? 0 : 255;
      const i = (y * dim + x) * 4;
      data[i] = v; data[i + 1] = v; data[i + 2] = v; data[i + 3] = 255;
    }
  }
  return { data, width: dim, height: dim };
}

let pass = 0;
const fails = [];
for (const text of CASES) {
  const svg = qr.qrSvg(text, 220, 4);
  const q = parseSvg(svg);
  const img = toImage(q);
  const res = jsQR(img.data, img.width, img.height);
  const ok = res && res.data === text;
  if (ok) pass++;
  else fails.push({ text, got: res ? res.data : null });
  console.log(
    `${ok ? '✅' : '❌'} v${(q.size - 17) / 4} ${q.size}×${q.size}  ` +
    `${JSON.stringify(text.length > 48 ? text.slice(0, 45) + '…' : text)}`
  );
}

console.log(`\n二维码交叉验证：${pass}/${CASES.length} 通过`);
if (fails.length) {
  console.log('失败用例：');
  for (const f of fails) {
    console.log(`  - 输入 ${JSON.stringify(f.text)}`);
    console.log(`    解出 ${JSON.stringify(f.got)}`);
  }
  process.exit(1);
}
