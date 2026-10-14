/**
 * 作品编码注册表（2026-10-14 定版 v2.1）
 *
 * ═══════════════════════════════════════════════════════════════
 * 这个文件是**编码的唯一权威来源**，三件事都从这里取：
 *   1. 官网 /verify/{编码} 档案页：按编码查作品，生成公开存证页
 *   2. 详情页 / 列表页：展示作品编码
 *   3. 构建期自检：校验所有编码的校验位是否正确（`npm run code -- check`）
 *
 * ⚠️ 校验位**永远用本文件的 calcCheck() 实算，不要手填**。
 *    校验位是「防抄错」，不是防伪——防伪靠档案页 + 实物证书。
 * ═══════════════════════════════════════════════════════════════
 */
import { readyMadeWorks, type ReadyMadeWork } from '../data/content';

/** 品类码 → 中文（与官网 category 体系对齐） */
export const CATEGORY_LABELS: Record<string, string> = {
  CL: '书法',
  HI: '手作 / 插画',
  HO: '非遗 / 器物',
  CP: '企业礼赠',
  PT: '出版物 / 合作',
};

/** 形态码 → 中文 */
export const FORM_LABELS: Record<string, string> = {
  SG: '案头摆件（A4 幅面）',
  SC: '案头摆件（圆光方幅）',
  WA: '墙面横幅',
  WP: '四条屏',
  WL: '通景长卷',
  FA: '洒金扇面',
  CX: '定制唯一件',
  OB: '器物',
};

/** 档位码 → 中文 */
export const TIER_LABELS: Record<string, string> = {
  T1: '入门档',
  T2: '心意档',
  T3: '珍藏档',
  T4: '定制档',
  T5: '大型定制档',
};

const MOD_WEIGHTS = [1, 3, 7, 9, 5, 11, 13] as const;

/** 字母转数字：A=1 … Z=26；数字原样保留 */
function lettersToDigits(s: string): string {
  let out = '';
  for (const ch of s.toUpperCase()) {
    if (ch >= '0' && ch <= '9') out += ch;
    else if (ch >= 'A' && ch <= 'Z') out += String(ch.charCodeAt(0) - 64);
  }
  return out;
}

/** 计算校验位。body 是不含校验位的主体，如 `XMA-CL-WA-26-0001-T2` */
export function calcCheck(body: string): number {
  const digits = lettersToDigits(body.replace(/-/g, ''));
  let total = 0;
  for (let i = 0; i < digits.length; i++) {
    total += Number(digits[i]) * MOD_WEIGHTS[i % MOD_WEIGHTS.length];
  }
  return (10 - (total % 10)) % 10;
}

/** 按各段生成完整编码（校验位实算） */
export function makeCode(opts: {
  category: string;
  form: string;
  year: number;
  seq: number;
  tier: string;
}): string {
  const body = `XMA-${opts.category}-${opts.form}-${String(opts.year % 100).padStart(2, '0')}-${String(opts.seq).padStart(4, '0')}-${opts.tier}`;
  return `${body}-${calcCheck(body)}`;
}

export type CodeParts = {
  raw: string;
  brand: string;
  category: string;
  form: string;
  year: number;
  seq: number;
  tier: string;
  check: number;
  categoryLabel: string;
  formLabel: string;
  tierLabel: string;
  /** 校验位是否通过（只说明「抄对了」，不说明「是真品」） */
  checkOk: boolean;
};

/** 解析编码。格式不对或校验位不符时返回 null。 */
export function parseCode(code: string): CodeParts | null {
  const normalized = code.trim().toUpperCase().replace(/\s+/g, '');
  const parts = normalized.split('-');
  if (parts.length !== 7) return null;
  const [brand, category, form, yy, seq, tier, chk] = parts;
  if (brand !== 'XMA') return null;
  if (!/^\d{2}$/.test(yy) || !/^\d{4}$/.test(seq) || !/^\d$/.test(chk)) return null;
  const body = parts.slice(0, 6).join('-');
  const expected = calcCheck(body);
  return {
    raw: normalized,
    brand,
    category,
    form,
    year: 2000 + Number(yy),
    seq: Number(seq),
    tier,
    check: Number(chk),
    categoryLabel: CATEGORY_LABELS[category] ?? category,
    formLabel: FORM_LABELS[form] ?? form,
    tierLabel: TIER_LABELS[tier] ?? tier,
    checkOk: Number(chk) === expected,
  };
}

export type WorkArchive = {
  work: ReadyMadeWork;
  parts: CodeParts;
  /** 这件作品在官网是否有公开档案（有编码且在册 = 有） */
  archived: true;
};

/** 全站在册作品的档案（编码 → 作品） */
export function getArchives(): WorkArchive[] {
  const out: WorkArchive[] = [];
  for (const work of readyMadeWorks) {
    const parts = parseCode(work.code);
    if (!parts) continue;
    out.push({ work, parts, archived: true });
  }
  return out;
}

/** 按编码查档案。校验位不过或不在册都返回 null。 */
export function findArchive(code: string): WorkArchive | null {
  const parts = parseCode(code);
  if (!parts || !parts.checkOk) return null;
  return getArchives().find((a) => a.parts.raw === parts.raw) ?? null;
}

/**
 * 构建期自检：所有编码的格式、校验位、年份段与 `year` 字段是否自洽。
 * 返回问题列表（空数组 = 全部通过）。
 */
export function auditCodes(): string[] {
  const issues: string[] = [];
  const seen = new Set<string>();
  for (const work of readyMadeWorks) {
    const parts = parseCode(work.code);
    if (!parts) {
      issues.push(`${work.slug}（${work.title}）：编码格式不合法 → ${work.code}`);
      continue;
    }
    if (!parts.checkOk) {
      issues.push(`${work.slug}（${work.title}）：校验位错误 → ${work.code}，应为 ${calcCheck(work.code.split('-').slice(0, 6).join('-'))}`);
    }
    if (parts.year !== work.year) {
      issues.push(`${work.slug}（${work.title}）：编码年份段 ${parts.year} 与 year 字段 ${work.year} 不一致`);
    }
    if (seen.has(work.code)) {
      issues.push(`${work.slug}（${work.title}）：编码重复 → ${work.code}`);
    }
    seen.add(work.code);
  }
  return issues;
}
