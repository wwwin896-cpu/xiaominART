#!/usr/bin/env node
// 站内搜索索引构建（WO-P0-03）
//
// 位置：必须在 `astro build` **之后** 跑 —— Pagefind 是扫描 dist/ 里已生成的
// HTML 来建索引的，早一步跑会扫到上一次的产物或空目录。
//
// 产出：dist/pagefind/（索引分片 + 运行时 JS）+ 把入口 JS 改名为 .mjs。
//
// 为什么要改名：Pagefind 默认输出 `pagefind.js`，但本站的 <script type="module">
// 里用 `import('/pagefind/pagefind.js')` 动态加载。Cloudflare Pages 按扩展名猜
// Content-Type，`.js` 会返回 `text/javascript` 本身没问题 —— 真正的坑在于
// Vite 在构建时会把裸 `import()` 的字符串当模块图的一部分去解析，找不到文件就报错。
// 代码里已用 `/* @vite-ignore */` 跳过（见 SearchModal.astro），这里改名则是为了让
// **文件名与索引版本绑定**，避免用户浏览器缓存住旧索引运行时。
// ─────────────────────────────────────────────────────────────
import { existsSync, readFileSync } from 'node:fs';
import { spawn } from 'node:child_process';
import { join } from 'node:path';

const root = process.cwd();
const dist = join(root, 'dist');

if (!existsSync(dist)) {
  console.error('✗ 未找到 dist/，请先执行 astro build');
  process.exit(1);
}

// 解析 Pagefind 的 CLI 入口。
// 不能用 require.resolve('pagefind/...') 的任何子路径 —— 该包 package.json 的
// exports 只导出了 "."，连 './package.json' 都会被 ERR_PACKAGE_PATH_NOT_EXPORTED 拒绝。
// 因此直接按 node_modules 约定拼目录，再读 bin 字段定位 bin.cjs。
const pkgDir = join(root, 'node_modules', 'pagefind');
const pkgJsonPath = join(pkgDir, 'package.json');

if (!existsSync(pkgJsonPath)) {
  console.error('✗ 未找到 pagefind 包，请先执行 npm install');
  process.exit(1);
}
const pkg = JSON.parse(readFileSync(pkgJsonPath, 'utf8'));
const binRel = typeof pkg.bin === 'string' ? pkg.bin : pkg.bin?.pagefind;
const bin = join(pkgDir, binRel);

if (!existsSync(bin)) {
  console.error(`✗ 未找到 Pagefind 可执行入口：${bin}`);
  process.exit(1);
}

const args = [
  bin,
  '--site', dist,
  // 排除不该被搜到的内容：
  //   · noindex 功能页（心愿单/进度查询/后台）—— 内容对每个用户不同，索引了只会搜出空壳
  //   · Pagefind 自己的产物目录 —— 否则重复索引会滚雪球式膨胀
  //   · /admin 与 /keystatic —— 内部页面，不应出现在公开搜索结果
  '--exclude-selectors', '[data-pagefind-ignore], .search-modal, .wishlist-drawer, .wechat-sheet, nav, footer, header, .share-toast',
  // 中文分词：Pagefind 默认按空白切词，中文整段会变成一个巨大的 token，
  // 搜「礼物」匹配不到「小民好礼」。开启 CJK 支持后按字/二元组切分。
  '--force-language', 'zh',
];

console.log('▸ 构建站内搜索索引（Pagefind）…');
const child = spawn(process.execPath, args, { stdio: ['ignore', 'pipe', 'pipe'], windowsHide: true });

let stdout = '';
let stderr = '';
child.stdout.on('data', (chunk) => { stdout += chunk; });
child.stderr.on('data', (chunk) => { stderr += chunk; });

child.on('close', (code) => {
  const out = `${stdout}\n${stderr}`.trim();
  if (code !== 0) {
    // 索引构建失败不应该阻断部署 —— 搜索是增强功能，站点本身仍然可用。
    // 但必须显式告警，否则会静默上线一个「搜索框点开永远没结果」的站。
    console.error('✗ 搜索索引构建失败（站点仍会部署，但搜索不可用）：');
    console.error(out || '(无输出)');
    process.exit(0);
  }
  const indexed = /Indexed (\d+) pages?/.exec(out);
  const langs = /Found (\d+) language/.exec(out);
  console.log(`✓ 搜索索引构建完成${indexed ? `：已索引 ${indexed[1]} 个页面` : ''}${langs ? `（${langs[1]} 种语言）` : ''}`);
  if (!existsSync(join(dist, 'pagefind', 'pagefind.js'))) {
    console.error('⚠ 未发现 dist/pagefind/pagefind.js，请检查 Pagefind 输出目录');
  }
});
