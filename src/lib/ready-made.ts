/**
 * 现货作品的「可编辑状态层」。
 *
 * 为什么有这一层：现货十二幅的正文（题字、释文、材质、价格、图）固定在
 * `src/data/content.ts`，属于代码；但「这幅卖掉没有」是**高频变动**的运营事实，
 * 不能要求业主每次卖出一幅都去找开发者改代码。
 *
 * 因此把售出状态抽到后台：Keystatic 集合「现货上下架」→ `content/ready-made-status/<slug>.yaml`。
 * 业主在 /keystatic/ 勾选 `sold`，提交后自动构建，约 2-3 分钟上线。
 *
 * 取值规则（保守优先，避免误把在售作品标成已售）：
 * - 存在对应 yaml 文件 → 以文件里的 `sold` 为准（勾选=已售出，取消勾选=重新上架）；
 * - 不存在该文件 → 回退到代码里的 `sold` 字段（兼容历史数据，也为新增作品留默认值）。
 */
import { parse } from 'yaml';
import { readyMadeWorks, type ReadyMadeWork } from '../data/content';

const statusFiles = import.meta.glob('../../content/ready-made-status/*.{yaml,yml}', {
  eager: true,
  query: '?raw',
  import: 'default',
}) as Record<string, string>;

/** slug → 是否已售出（只包含确实存在状态文件的作品）。 */
function statusBySlug(): Map<string, boolean> {
  const map = new Map<string, boolean>();
  for (const [path, raw] of Object.entries(statusFiles)) {
    const slug = path.split('/').pop()?.replace(/\.ya?ml$/, '');
    if (!slug) continue;
    const data = (parse(raw) ?? {}) as Record<string, unknown>;
    map.set(slug, data.sold === true);
  }
  return map;
}

/** 全套现货作品，已合并后台标注的售出状态。页面与 sitemap 都应从这里取数。 */
export function getReadyMadeWorks(): ReadyMadeWork[] {
  const status = statusBySlug();
  return readyMadeWorks.map((work) => ({
    ...work,
    sold: status.has(work.slug) ? status.get(work.slug) === true : Boolean(work.sold),
  }));
}

/** 单幅现货作品（已合并售出状态）。 */
export function getReadyMadeWork(slug: string): ReadyMadeWork | undefined {
  return getReadyMadeWorks().find((work) => work.slug === slug);
}
