#!/usr/bin/env node
// @ts-nocheck
// ─────────────────────────────────────────────────────────────
// 双端视觉守门（2026-11-06）
//
// 目的：改桌面端时证明移动端「一个像素都没动」，反之亦然。
//      业主反复要求「两端可以不同步更新」，靠肉眼看截图不可靠——
//      本次改为改动前后对「不该变的那一端」做全页像素比对。
//
// 用法（本地工具，不进 CI，需要 playwright + sharp）：
//   1) 改代码前，先给当前构建拍基线：
//        npm run build
//        node scripts/dual-view-guard.mjs snap --tag before
//   2) 改完再构建，重拍并比对（--expect 声明这次允许变的一端）：
//        npm run build
//        node scripts/dual-view-guard.mjs snap --tag after
//        node scripts/dual-view-guard.mjs diff --tag before --expect desktop
//      → desktop 允许变化；mobile 若有任何差异则退出码 1，必须修好再提交。
//
// 参数：
//   --tag <name>      快照标签（默认 before / after 各取一次，目录 /tmp/dual-view）
//   --only <end>      仅拍某一端：desktop | mobile
//   --expect <end>    本次允许变化的一端（不给则只报告、不改退出码）
//   --pages a,b,c     自定义页面路径（默认见 PAGES）
//   --root <dir>      构建产物目录（默认 dist）
//   --threshold <pct> 差异像素占比阈值（默认 0.02，即几乎零容忍）
// ─────────────────────────────────────────────────────────────
import { createServer } from 'node:http';
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import { join, extname, resolve, dirname } from 'node:path';
import { execSync } from 'node:child_process';
import { pathToFileURL } from 'node:url';
import sharp from 'sharp';

const ENDS = {
  desktop: { width: 1440, height: 900, label: '桌面 1440×900' },
  mobile: { width: 390, height: 844, label: '移动 390×844 @2x', isMobile: true, dsf: 2 },
};

const PAGES = ['/', '/gifts/', '/gifts/ready-made/', '/intangible/', '/partners/'];

const MIME = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.webp': 'image/webp',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.png': 'image/png',
  '.woff2': 'font/woff2',
  '.xml': 'application/xml; charset=utf-8',
};

function parseArgs(argv) {
  const args = { _: [] };
  for (let i = 0; i < argv.length; i++) {
    const raw = argv[i];
    if (!raw.startsWith('--')) {
      args._.push(raw);
      continue;
    }
    const eq = raw.indexOf('=');
    if (eq > -1) {
      args[raw.slice(2, eq)] = raw.slice(eq + 1);
      continue;
    }
    const key = raw.slice(2);
    const next = argv[i + 1];
    if (next !== undefined && !next.startsWith('--')) {
      args[key] = next;
      i++;
    } else {
      args[key] = true;
    }
  }
  return args;
}

async function loadChromium() {
  try {
    return (await import('playwright')).chromium;
  } catch {
    const globalRoot = execSync('npm root -g', { encoding: 'utf8' }).trim();
    const entry = join(globalRoot, 'playwright', 'index.mjs');
    if (!existsSync(entry)) {
      throw new Error('未找到 playwright，请先 npm i -g playwright');
    }
    return (await import(pathToFileURL(entry).href)).chromium;
  }
}

function serve(root) {
  const server = createServer(async (req, res) => {
    try {
      const url = decodeURIComponent((req.url || '/').split('?')[0]);
      let file = join(root, url);
      if (url.endsWith('/')) file = join(file, 'index.html');
      if (!extname(file)) {
        if (existsSync(join(file, 'index.html'))) file = join(file, 'index.html');
        else file += '.html';
      }
      const body = await readFile(file);
      res.writeHead(200, { 'content-type': MIME[extname(file)] || 'application/octet-stream' });
      res.end(body);
    } catch {
      res.writeHead(404, { 'content-type': 'text/plain' });
      res.end('not found');
    }
  });
  return new Promise((ok) => server.listen(0, '127.0.0.1', () => ok(server)));
}

const pageKey = (p) => (p === '/' ? 'home' : p.replace(/^\/|\/$/g, '').replace(/\//g, '-'));

const FREEZE_CSS = `
  *, *::before, *::after {
    animation: none !important;
    transition: none !important;
    caret-color: transparent !important;
  }
  html { scroll-behavior: auto !important; }
  [class*="cookie"], [id*="cookie"], .floating-consult, [data-float-consult] { display: none !important; }
`;

async function snapOne(page, url, file) {
  await page.goto(url, { waitUntil: 'networkidle', timeout: 60000 });
  await page.addStyleTag({ content: FREEZE_CSS });
  // 逐屏滚动，触发懒加载图片，再回到顶部
  await page.evaluate(async () => {
    const step = window.innerHeight * 0.8;
    for (let y = 0; y < document.body.scrollHeight; y += step) {
      window.scrollTo(0, y);
      await new Promise((r) => setTimeout(r, 60));
    }
    window.scrollTo(0, 0);
  });
  await page.waitForTimeout(500);
  await page.screenshot({ path: file, fullPage: true });
}

async function cmdSnap(args) {
  const root = resolve(args.root || 'dist');
  const outDir = args.out || '/tmp/dual-view';
  const tag = args.tag || 'after';
  const only = args.only ? [args.only] : Object.keys(ENDS);
  const pages = args.pages ? String(args.pages).split(',') : PAGES;

  await mkdir(outDir, { recursive: true });
  const chromium = await loadChromium();
  const server = await serve(root);
  const base = `http://127.0.0.1:${server.address().port}`;
  const browser = await chromium.launch();

  for (const end of only) {
    const cfg = ENDS[end];
    if (!cfg) continue;
    const page = await browser.newPage({
      viewport: { width: cfg.width, height: cfg.height },
      deviceScaleFactor: cfg.dsf || 1,
      isMobile: !!cfg.isMobile,
      hasTouch: !!cfg.isMobile,
    });
    const errors = [];
    page.on('pageerror', (e) => errors.push(String(e)));
    for (const p of pages) {
      const file = join(outDir, `${tag}-${end}-${pageKey(p)}.png`);
      await snapOne(page, base + p, file);
      console.log(`snap ${end.padEnd(7)} ${p.padEnd(20)} → ${file}`);
    }
    if (errors.length) console.log(`⚠️  ${end} 页面脚本错误 ${errors.length} 条：${errors[0]}`);
    await page.close();
  }

  await browser.close();
  server.close();
}

async function diffRegion(beforeFile, afterFile) {
  const a = await sharp(beforeFile).removeAlpha().raw().toBuffer({ resolveWithObject: true });
  const b = await sharp(afterFile).removeAlpha().raw().toBuffer({ resolveWithObject: true });
  if (a.info.width !== b.info.width || a.info.height !== b.info.height) {
    return {
      sizeChanged: true,
      heightDelta: b.info.height - a.info.height,
      ratio: 1,
      bands: [{ from: 0, to: b.info.height, ratio: 1 }],
    };
  }
  const { width, height, channels } = a.info;
  const da = a.data;
  const db = b.data;
  const rowDiff = new Uint8Array(height);
  let changed = 0;
  for (let y = 0; y < height; y++) {
    let rowChanged = 0;
    for (let x = 0; x < width; x++) {
      const i = (y * width + x) * channels;
      if (
        Math.abs(da[i] - db[i]) > 6 ||
        Math.abs(da[i + 1] - db[i + 1]) > 6 ||
        Math.abs(da[i + 2] - db[i + 2]) > 6
      ) {
        rowChanged++;
      }
    }
    if (rowChanged > width * 0.002) {
      rowDiff[y] = 1;
      changed += rowChanged;
    }
  }
  const bands = [];
  for (let y = 0; y < height; y++) {
    if (!rowDiff[y]) continue;
    let end = y;
    while (end + 1 < height && rowDiff[end + 1]) end++;
    bands.push({ from: y, to: end });
    y = end;
  }
  for (const band of bands) {
    let n = 0;
    for (let y = band.from; y <= band.to; y++) {
      for (let x = 0; x < width; x++) {
        const i = (y * width + x) * channels;
        if (
          Math.abs(da[i] - db[i]) > 6 ||
          Math.abs(da[i + 1] - db[i + 1]) > 6 ||
          Math.abs(da[i + 2] - db[i + 2]) > 6
        ) n++;
      }
    }
    band.ratio = n / (width * height);
  }
  return { sizeChanged: false, ratio: changed / (width * height), bands };
}

async function cmdDiff(args) {
  const outDir = args.out || '/tmp/dual-view';
  const tag = args.tag || 'before';
  const pages = args.pages ? String(args.pages).split(',') : PAGES;
  const expect = args.expect ? String(args.expect) : null;
  const threshold = args.threshold ? Number(args.threshold) : 0.02;

  let failed = false;
  console.log(`\n比对基线 ${tag} ↔ 当前（阈值 ${threshold}%，允许变化：${expect || '未指定（只报告）'}）\n`);
  for (const end of Object.keys(ENDS)) {
    for (const p of pages) {
      const key = pageKey(p);
      const before = join(outDir, `${tag}-${end}-${key}.png`);
      const after = join(outDir, `after-${end}-${key}.png`);
      if (!existsSync(before) || !existsSync(after)) continue;
      const r = await diffRegion(before, after);
      const changed = r.sizeChanged || r.ratio * 100 > threshold;
      if (r.sizeChanged) {
        console.log(
          `${end.padEnd(8)} ${p.padEnd(20)} 高度变化 ${r.heightDelta > 0 ? '+' : ''}${r.heightDelta}px  ← 版面撑高/压缩`
        );
      } else if (!changed) {
        console.log(`${end.padEnd(8)} ${p.padEnd(20)} 干净  0.000% ✓`);
      } else {
        const bands = r.bands
          .slice(0, 4)
          .map((b) => `y=${b.from}-${b.to}(${(b.ratio * 100).toFixed(2)}%)`)
          .join(' ');
        console.log(`${end.padEnd(8)} ${p.padEnd(20)} 变化 ${(r.ratio * 100).toFixed(3)}%  ${bands}`);
      }
      if (changed && expect && end !== expect) failed = true;
    }
  }
  if (failed) {
    console.log(`\n✗ 不该变的一端被改动了（应为零差异）。修好再提交。`);
    process.exit(1);
  }
  console.log(`\n✓ 守门通过`);
}

const args = parseArgs(process.argv.slice(2));
const cmd = args._[0];
if (cmd === 'snap') {
  await cmdSnap(args);
} else if (cmd === 'diff') {
  await cmdDiff(args);
} else {
  console.log('用法：node scripts/dual-view-guard.mjs snap --tag before [--only mobile]');
  console.log('      node scripts/dual-view-guard.mjs diff --tag before --expect desktop');
  process.exit(1);
}
