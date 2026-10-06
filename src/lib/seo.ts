import { execFileSync } from 'node:child_process';
import { statSync } from 'node:fs';
import path from 'node:path';

/**
 * SEO 用 lastmod 计算：取「内容源文件的最后一次 git 提交日期」。
 *
 * 两个坑（2026-10-06 修复）：
 *   1. 不用 execSync —— Windows 下它会走 cmd.exe，构建时常见 spawnSync EBUSY，
 *      导致整段 git 历史失效；改用 execFileSync 直连 git 可执行文件。
 *   2. 不用 %ct + toISOString() —— epoch 转 UTC 会比北京时间少一天；
 *      改用 %cs，由 git 直接给出提交者本地日期（YYYY-MM-DD）。
 * 只有 git 历史确实不可用（浅克隆等）时，才退回文件 mtime。
 */
let gitMap: Map<string, string> | null | undefined;

function loadGitMap(): Map<string, string> | null {
  if (gitMap !== undefined) return gitMap;
  gitMap = null;
  try {
    const out = execFileSync(
      'git',
      ['--no-pager', 'log', '--format=%cs', '--name-only', '--no-renames'],
      {
        encoding: 'utf8',
        cwd: process.cwd(),
        maxBuffer: 64 * 1024 * 1024,
        stdio: ['ignore', 'pipe', 'ignore'],
      },
    );
    const DATE = /^\d{4}-\d{2}-\d{2}$/;
    const map = new Map<string, string>();
    let cur = '';
    for (const raw of out.split(/\r?\n/)) {
      const line = raw.trim();
      if (!line) continue;
      if (DATE.test(line)) {
        cur = line;
        continue;
      }
      // git log 由新到旧排列，某文件首次出现即为其最后一次提交
      if (cur && !map.has(line)) map.set(line, cur);
    }
    gitMap = map.size ? map : null;
  } catch {
    gitMap = null;
  }
  return gitMap;
}

const pad = (n: number) => String(n).padStart(2, '0');
const localDate = (d: Date) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;

/** 根据一组信号文件计算 YYYY-MM-DD 格式的 lastmod。 */
export function lastmodFor(files: string[]): string {
  const map = loadGitMap();
  if (map) {
    let best = '';
    for (const f of files) {
      const d = map.get(f.replace(/\\/g, '/'));
      if (d && d > best) best = d; // YYYY-MM-DD 字典序即时间序
    }
    if (best) return best;
  }
  let ts = 0;
  for (const f of files) {
    try {
      const m = statSync(path.join(process.cwd(), f)).mtimeMs;
      if (m > ts) ts = m;
    } catch {
      /* 信号文件不存在时跳过 */
    }
  }
  return localDate(ts ? new Date(ts) : new Date());
}
