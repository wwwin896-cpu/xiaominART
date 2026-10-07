#!/usr/bin/env node
// 图片管线（T-04，2026-10-07）：为 public/assets 下的 JPG/PNG 生成 WebP 副本与响应式变体。
// - 基础副本：宽超过 1600px 的等比缩到 1600，质量 78
// - 响应式变体：600w / 1000w（仅当源图明显更大时生成，绝不放大），
//   供 <Pic> 组件输出 srcset，让卡片/列表在移动端加载小图
// - 清单：public/assets/webp-variants.json 记录每个源图可用的变体宽度，Pic 构建期读取
// - 幂等：已有 .webp 且比源图新则跳过；孤儿 webp 清理
// - 用法：node scripts/gen-webp.mjs（npm run build 会自动先跑）
import sharp from 'sharp';
import { readdirSync, statSync, existsSync, unlinkSync, writeFileSync } from 'node:fs';
import { join, extname, relative } from 'node:path';

const ROOT = join(process.cwd(), 'public', 'assets');
const MANIFEST = join(process.cwd(), 'public', 'assets', 'webp-variants.json');
const MAX_WIDTH = 1600;
const QUALITY = 78;
const VARIANTS = [
  { suffix: '-600', width: 600, minSource: 900 },
  { suffix: '-1000', width: 1000, minSource: 1300 },
];
const EXTENSIONS = new Set(['.jpg', '.jpeg', '.png']);
// 变体文件名正则（单一来源：由 VARIANTS 派生），供孤儿清理剥离变体后缀
const VARIANT_RE = new RegExp(`-(${VARIANTS.map((v) => v.width).join('|')})\\.webp$`, 'i');

let created = 0;
let skipped = 0;
let sourceBytes = 0;
let webpBytes = 0;
/** @type {Record<string, number[]>} */
const manifest = {};

/** @param {string} file */
async function toWebp(file) {
  const webp = file.replace(/\.(jpe?g|png)$/i, '.webp');
  const srcStat = statSync(file);
  sourceBytes += srcStat.size;

  if (existsSync(webp)) {
    const webpStat = statSync(webp);
    if (webpStat.mtimeMs >= srcStat.mtimeMs) skipped += 1;
  }
  if (!existsSync(webp) || statSync(webp).mtimeMs < srcStat.mtimeMs) {
    const pipeline = sharp(file).rotate();
    const meta = await pipeline.metadata();
    if ((meta.width ?? 0) > MAX_WIDTH) pipeline.resize({ width: MAX_WIDTH });
    const info = await pipeline.webp({ quality: QUALITY }).toFile(webp);
    created += 1;
    const saved = Math.max(0, Math.round((1 - info.size / srcStat.size) * 100));
    console.log(`  webp ✓ ${relative(process.cwd(), file)} → ${relative(process.cwd(), webp)}（省 ${saved}%）`);
  }

  // 基础副本 + 变体宽度登记（供 Pic 生成 srcset）
  const srcMeta = await sharp(file).metadata();
  const baseWidth = Math.min(srcMeta.width ?? MAX_WIDTH, MAX_WIDTH);
  const widths = [baseWidth];
  for (const v of VARIANTS) {
    if ((srcMeta.width ?? 0) < v.minSource) continue;
    const variant = file.replace(/\.(jpe?g|png)$/i, `${v.suffix}.webp`);
    if (!existsSync(variant) || statSync(variant).mtimeMs < srcStat.mtimeMs) {
      await sharp(file).rotate().resize({ width: v.width }).webp({ quality: QUALITY }).toFile(variant);
      created += 1;
    }
    widths.push(v.width);
  }
  manifest[`/${relative(join(process.cwd(), 'public'), file).replace(/\\/g, '/')}`] = widths.sort((a, b) => a - b);
  webpBytes += statSync(webp).size;
}

/** @param {string} dir */
async function cleanOrphans(dir) {
  for (const name of readdirSync(dir)) {
    const full = join(dir, name);
    if (statSync(full).isDirectory()) { await cleanOrphans(full); continue; }
    if (extname(name).toLowerCase() === '.webp') {
      // 先剥变体后缀（x-600.webp → x），再剥 .webp 本身（x.webp → x），
      // 两步都不能省：一步到位的正则会让基础版 x.webp 得到 x.webp 而误判为孤儿
      const src = full.replace(VARIANT_RE, '').replace(/\.webp$/i, '');
      const srcExists = existsSync(`${src}.jpg`) || existsSync(`${src}.jpeg`) || existsSync(`${src}.png`);
      if (!srcExists) { unlinkSync(full); console.log(`  清理孤儿 webp：${relative(process.cwd(), full)}`); }
    }
  }
}

/** @param {string} dir */
async function walk(dir) {
  for (const name of readdirSync(dir)) {
    const full = join(dir, name);
    if (statSync(full).isDirectory()) { await walk(full); continue; }
    if (EXTENSIONS.has(extname(name).toLowerCase())) await toWebp(full);
  }
}

console.log('生成 WebP（T-04 图片管线）…');
await walk(ROOT);
await cleanOrphans(ROOT);
writeFileSync(MANIFEST, JSON.stringify(manifest, null, 1));
const ratio = sourceBytes > 0 ? Math.round((1 - webpBytes / sourceBytes) * 100) : 0;
console.log(`完成：新增 ${created} 个、复用 ${skipped} 个；基础 webp 总体积约为源图 ${100 - ratio}%（省 ${ratio}%）；清单 ${Object.keys(manifest).length} 项`);
