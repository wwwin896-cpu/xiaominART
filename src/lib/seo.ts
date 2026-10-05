import { execSync } from 'node:child_process';
import { statSync } from 'node:fs';
import path from 'node:path';

/**
 * SEO 用 lastmod 计算：取「内容源文件的最后一次 git 提交时间」，
 * 找不到 git 历史（如浅克隆）时退回文件 mtime，再退回构建日期。
 *
 * 注意：CI 中需要 actions/checkout 的 fetch-depth: 0 才能取到每个文件的
 * 完整提交历史（见 .github/workflows/deploy.yml），否则所有文件都会
 * 退回 mtime（等于 checkout 时刻，即部署当天）。
 */
let gitMap: Map<string, number> | null | undefined;

function loadGitMap(): Map<string, number> | null {
  if (gitMap !== undefined) return gitMap;
  gitMap = null;
  try {
    // 一次遍历全部提交历史，构建 文件路径 -> 最后提交时间(ms) 的映射
    const out = execSync('git log --format=%ct --name-only', {
      encoding: 'utf8',
      cwd: process.cwd(),
      maxBuffer: 64 * 1024 * 1024,
    });
    const map = new Map<string, number>();
    let ts = 0;
    for (const line of out.split(/\r?\n/)) {
      const t = line.trim();
      if (!t) continue;
      if (/^\d+$/.test(t)) {
        ts = parseInt(t, 10) * 1000;
        continue;
      }
      const prev = map.get(t);
      if (prev === undefined || ts > prev) map.set(t, ts);
    }
    gitMap = map.size ? map : null;
  } catch {
    gitMap = null;
  }
  return gitMap;
}

/** 根据一组信号文件计算 YYYY-MM-DD 格式的 lastmod。 */
export function lastmodFor(files: string[]): string {
  const map = loadGitMap();
  let ts = 0;
  for (const f of files) {
    if (map) {
      const t = map.get(f.replace(/\\/g, '/'));
      if (t && t > ts) ts = t;
    }
    try {
      const m = statSync(path.join(process.cwd(), f)).mtimeMs;
      if (m > ts) ts = m;
    } catch {
      /* 信号文件不存在时跳过 */
    }
  }
  if (!ts) return new Date().toISOString().slice(0, 10);
  return new Date(ts).toISOString().slice(0, 10);
}
