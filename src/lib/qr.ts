// ─────────────────────────────────────────────────────────────
// 二维码生成（纯前端、零依赖、不请求任何第三方）
//
// 为什么自己实现而不调外部 API：
//   1. 外部二维码服务（如 api.qrserver.com）会把「客户扫的什么码」暴露给第三方；
//   2. 作品编码是防伪资产，生成链路不该依赖外部服务可用性；
//   3. 静态生成时就能把 SVG 直接写进 HTML，零运行时开销、零请求。
//
// 实现范围：Byte 模式 + 纠错等级 M，支持版本 1–10（最多 254 字节）。
// 作品档案页的 URL 长度在 50–70 字符，版本 4 以内足够。
// ─────────────────────────────────────────────────────────────

const EC_LEVEL_M = { formatBits: 0, ecCodewordsPerBlock: [0, 10, 16, 26, 18, 24, 16, 18, 22, 22, 26] };

// 版本 → (每块纠错码字数, 分组)
//
// ⚠️ 分组语义：groups 的每一项是 [块数, 每块数据码字数]，**不是** [count, size] 的反面。
//    例：版本 4 的 [[2, 32]] 表示「2 块，每块 32 个数据码字」→ 总 block 数 = 2（取 [0]）。
//    2026-10-14 踩坑：曾误把 g[1] 当作块数累加，导致 dataCodewords 全为负、
//    pickVersion() 对 52 字节的 URL 直接抛「内容过长」。取块数一律用 g[0]。
//
// 仅列出版本 1–10 的 M 级参数（覆盖本项目所需的全部长度）
const M_EC_TABLE: Record<number, { ecPerBlock: number; groups: [number, number][] }> = {
  1: { ecPerBlock: 10, groups: [[1, 16]] },
  2: { ecPerBlock: 16, groups: [[1, 28]] },
  3: { ecPerBlock: 26, groups: [[1, 44]] },
  4: { ecPerBlock: 18, groups: [[2, 32]] },
  5: { ecPerBlock: 24, groups: [[2, 43]] },
  6: { ecPerBlock: 16, groups: [[4, 27]] },
  7: { ecPerBlock: 18, groups: [[4, 31]] },
  8: { ecPerBlock: 22, groups: [[2, 38], [2, 39]] },
  9: { ecPerBlock: 22, groups: [[3, 36], [2, 37]] },
  10: { ecPerBlock: 26, groups: [[4, 43], [1, 44]] },
};

const TOTAL_CODEWORDS: Record<number, number> = {
  1: 26, 2: 44, 3: 70, 4: 100, 5: 134, 6: 172, 7: 196, 8: 242, 9: 292, 10: 346,
};

const ALIGNMENT: Record<number, number[]> = {
  1: [], 2: [6, 18], 3: [6, 22], 4: [6, 26], 5: [6, 30],
  6: [6, 34], 7: [6, 22, 38], 8: [6, 24, 42], 9: [6, 26, 46], 10: [6, 28, 50],
};

// ── GF(256) 伽罗瓦域运算（QR 纠错所需）──
const EXP = new Uint8Array(512);
const LOG = new Uint8Array(256);
(() => {
  let x = 1;
  for (let i = 0; i < 255; i++) {
    EXP[i] = x;
    LOG[x] = i;
    x <<= 1;
    if (x & 0x100) x ^= 0x11d;
  }
  for (let i = 255; i < 512; i++) EXP[i] = EXP[i - 255];
})();

const gfMul = (a: number, b: number): number => (a === 0 || b === 0 ? 0 : EXP[LOG[a] + LOG[b]]);

/** 生成 degree 次的 Reed-Solomon 生成多项式 */
function rsGenPoly(degree: number): number[] {
  let poly = [1];
  for (let i = 0; i < degree; i++) {
    const next = new Array(poly.length + 1).fill(0);
    for (let j = 0; j < poly.length; j++) {
      next[j] ^= gfMul(poly[j], 1);
      next[j + 1] ^= gfMul(poly[j], EXP[i]);
    }
    poly = next;
  }
  return poly;
}

/** 对一块数据计算纠错码字 */
function rsEncode(data: number[], ecLen: number): number[] {
  const gen = rsGenPoly(ecLen);
  const res = new Array(ecLen).fill(0);
  for (const byte of data) {
    const factor = byte ^ res[0];
    res.shift();
    res.push(0);
    if (factor !== 0) {
      for (let i = 0; i < ecLen; i++) res[i] ^= gfMul(gen[i + 1], factor);
    }
  }
  return res;
}

/** 分组总块数（groups 每项为 [块数, 每块数据码字数]，块数在 [0] 位） */
function countBlocks(groups: [number, number][]): number {
  return groups.reduce((s, [count]) => s + count, 0);
}

/** 选择能容纳 byteLen 的最小版本 */
function pickVersion(byteLen: number): number {
  for (let v = 1; v <= 10; v++) {
    const total = TOTAL_CODEWORDS[v];
    const ecPerBlock = M_EC_TABLE[v].ecPerBlock;
    const blocks = countBlocks(M_EC_TABLE[v].groups);
    const dataCodewords = total - ecPerBlock * blocks;
    // 模式指示符 4 bit + 长度指示符（版本 1–9 为 8 bit，10 起为 16 bit）
    const headerBits = 4 + (v <= 9 ? 8 : 16);
    if (dataCodewords * 8 - headerBits >= byteLen * 8) return v;
  }
  throw new Error('内容过长，超出本实现支持范围（版本 10 / 254 字节）');
}

type Bit = number;

function pushBits(bits: Bit[], value: number, length: number): void {
  for (let i = length - 1; i >= 0; i--) bits.push((value >> i) & 1);
}

/** 文本 → 数据码字序列（Byte 模式 + 纠错分块交织） */
function buildCodewords(text: string, version: number): number[] {
  const bytes = Array.from(new TextEncoder().encode(text));
  const bits: Bit[] = [];
  pushBits(bits, 0b0100, 4); // Byte 模式
  pushBits(bits, bytes.length, version <= 9 ? 8 : 16);
  for (const b of bytes) pushBits(bits, b, 8);

  const total = TOTAL_CODEWORDS[version];
  const { ecPerBlock, groups } = M_EC_TABLE[version];
  const blockCount = countBlocks(groups);
  const dataCodewords = total - ecPerBlock * blockCount;

  // 终止符（最多 4 bit）
  const maxBits = dataCodewords * 8;
  for (let i = 0; i < 4 && bits.length < maxBits; i++) bits.push(0);
  while (bits.length % 8 !== 0) bits.push(0);

  const dataBytes: number[] = [];
  for (let i = 0; i < bits.length; i += 8) {
    let v = 0;
    for (let j = 0; j < 8; j++) v = (v << 1) | bits[i + j];
    dataBytes.push(v);
  }
  // 补齐码字
  const pad = [0xec, 0x11];
  let p = 0;
  while (dataBytes.length < dataCodewords) dataBytes.push(pad[p++ % 2]);

  // 分块 + 纠错 + 交织
  const dataBlocks: number[][] = [];
  const ecBlocks: number[][] = [];
  let offset = 0;
  for (const [count, size] of groups) {
    for (let i = 0; i < count; i++) {
      const block = dataBytes.slice(offset, offset + size);
      offset += size;
      dataBlocks.push(block);
      ecBlocks.push(rsEncode(block, ecPerBlock));
    }
  }
  const out: number[] = [];
  const maxDataLen = Math.max(...dataBlocks.map((b) => b.length));
  for (let i = 0; i < maxDataLen; i++) {
    for (const b of dataBlocks) if (i < b.length) out.push(b[i]);
  }
  for (let i = 0; i < ecPerBlock; i++) {
    for (const b of ecBlocks) if (i < b.length) out.push(b[i]);
  }
  return out;
}

/** 构建矩阵（含功能图形、数据填充、掩码选择） */
function buildMatrix(codewords: number[], version: number): boolean[][] {
  const size = version * 4 + 17;
  const matrix: (boolean | null)[][] = Array.from({ length: size }, () => new Array(size).fill(null));
  const reserved: boolean[][] = Array.from({ length: size }, () => new Array(size).fill(false));

  const setFinder = (row: number, col: number) => {
    for (let r = -1; r <= 7; r++) {
      for (let c = -1; c <= 7; c++) {
        const rr = row + r;
        const cc = col + c;
        if (rr < 0 || rr >= size || cc < 0 || cc >= size) continue;
        const inOuter = r >= 0 && r <= 6 && c >= 0 && c <= 6;
        const isBorder = r === 0 || r === 6 || c === 0 || c === 6;
        const isCenter = r >= 2 && r <= 4 && c >= 2 && c <= 4;
        if (inOuter) matrix[rr][cc] = isBorder || isCenter;
        else matrix[rr][cc] = false;
        reserved[rr][cc] = true;
      }
    }
  };
  setFinder(0, 0);
  setFinder(0, size - 7);
  setFinder(size - 7, 0);

  // 定位图形（对齐图案）
  const positions = ALIGNMENT[version] ?? [];
  for (const r of positions) {
    for (const c of positions) {
      if (reserved[r][c]) continue;
      for (let dr = -2; dr <= 2; dr++) {
        for (let dc = -2; dc <= 2; dc++) {
          const rr = r + dr;
          const cc = c + dc;
          const isBorder = Math.abs(dr) === 2 || Math.abs(dc) === 2;
          const isCenter = dr === 0 && dc === 0;
          matrix[rr][cc] = isBorder || isCenter;
          reserved[rr][cc] = true;
        }
      }
    }
  }

  // 定时图形
  for (let i = 8; i < size - 8; i++) {
    if (!reserved[6][i]) { matrix[6][i] = i % 2 === 0; reserved[6][i] = true; }
    if (!reserved[i][6]) { matrix[i][6] = i % 2 === 0; reserved[i][6] = true; }
  }

  // 固定的暗模块
  matrix[size - 8][8] = true;
  reserved[size - 8][8] = true;

  // 预留格式信息区
  for (let i = 0; i < 9; i++) {
    if (!reserved[8][i]) reserved[8][i] = true;
    if (!reserved[i][8]) reserved[i][8] = true;
  }
  for (let i = 0; i < 8; i++) {
    reserved[8][size - 1 - i] = true;
    reserved[size - 1 - i][8] = true;
  }

  // 数据填充（之字形）
  const allBits: Bit[] = [];
  for (const cw of codewords) pushBits(allBits, cw, 8);

  let bitIdx = 0;
  let upward = true;
  for (let col = size - 1; col > 0; col -= 2) {
    if (col === 6) col = 5;
    for (let i = 0; i < size; i++) {
      const row = upward ? size - 1 - i : i;
      for (const c of [col, col - 1]) {
        if (reserved[row][c]) continue;
        matrix[row][c] = bitIdx < allBits.length ? allBits[bitIdx] === 1 : false;
        bitIdx++;
      }
    }
    upward = !upward;
  }

  // 选择掩码（对 8 种掩码按惩罚分择优）
  const applyMask = (mask: number, m: (boolean | null)[][]) => {
    for (let r = 0; r < size; r++) {
      for (let c = 0; c < size; c++) {
        if (reserved[r][c]) continue;
        const cond = [
          (r + c) % 2 === 0,
          r % 2 === 0,
          c % 3 === 0,
          (r + c) % 3 === 0,
          (Math.floor(r / 2) + Math.floor(c / 3)) % 2 === 0,
          ((r * c) % 2) + ((r * c) % 3) === 0,
          (((r * c) % 2) + ((r * c) % 3)) % 2 === 0,
          (((r + c) % 2) + ((r * c) % 3)) % 2 === 0,
        ][mask];
        if (cond) m[r][c] = !m[r][c];
      }
    }
  };

  const penalty = (m: (boolean | null)[][]): number => {
    let score = 0;
    const get = (r: number, c: number) => m[r][c] === true;
    for (let r = 0; r < size; r++) {
      let run = 1;
      for (let c = 1; c < size; c++) {
        if (get(r, c) === get(r, c - 1)) { run++; if (run === 5) score += 3; else if (run > 5) score += 1; }
        else run = 1;
      }
    }
    for (let c = 0; c < size; c++) {
      let run = 1;
      for (let r = 1; r < size; r++) {
        if (get(r, c) === get(r - 1, c)) { run++; if (run === 5) score += 3; else if (run > 5) score += 1; }
        else run = 1;
      }
    }
    for (let r = 0; r < size - 1; r++) {
      for (let c = 0; c < size - 1; c++) {
        const v = get(r, c);
        if (v === get(r, c + 1) && v === get(r + 1, c) && v === get(r + 1, c + 1)) score += 3;
      }
    }
    return score;
  };

  let bestMask = 0;
  let bestScore = Infinity;
  let bestMatrix: (boolean | null)[][] | null = null;
  for (let mask = 0; mask < 8; mask++) {
    const copy = matrix.map((row) => row.slice());
    applyMask(mask, copy);
    const s = penalty(copy);
    if (s < bestScore) { bestScore = s; bestMask = mask; bestMatrix = copy; }
  }
  const finalMatrix = bestMatrix!;

  // 写入格式信息（M 级 + 掩码）
  const FORMAT_M = 0;
  const formatBits = (FORMAT_M << 3) | bestMask;
  let formatValue = formatBits << 10;
  const G = 0b10100110111;
  for (let i = 14; i >= 10; i--) {
    if ((formatValue >> i) & 1) formatValue ^= G << (i - 10);
  }
  const formatFinal = ((formatBits << 10) | formatValue) ^ 0b101010000010010;

  for (let i = 0; i < 15; i++) {
    const bit = ((formatFinal >> i) & 1) === 1;
    // 左上
    if (i < 6) finalMatrix[8][i] = bit;
    else if (i === 6) finalMatrix[8][7] = bit;
    else if (i === 7) finalMatrix[8][8] = bit;
    else if (i === 8) finalMatrix[7][8] = bit;
    else finalMatrix[14 - i][8] = bit;
    // 副本
    if (i < 8) finalMatrix[8][size - 1 - i] = bit;
    else finalMatrix[size - 15 + i][8] = bit;
  }
  finalMatrix[size - 8][8] = true;

  return finalMatrix.map((row) => row.map((v) => v === true));
}

/**
 * 生成二维码 SVG 字符串。
 * @param text 要编码的内容
 * @param size 输出边长（px），默认 220
 * @param margin 静区模块数，默认 4
 */
export function qrSvg(text: string, size = 220, margin = 4): string {
  const version = pickVersion(new TextEncoder().encode(text).length);
  const codewords = buildCodewords(text, version);
  const matrix = buildMatrix(codewords, version);
  const n = matrix.length;
  const total = n + margin * 2;

  let path = '';
  for (let r = 0; r < n; r++) {
    for (let c = 0; c < n; c++) {
      if (matrix[r][c]) path += `M${c + margin} ${r + margin}h1v1h-1z`;
    }
  }

  return (
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${total} ${total}" width="${size}" height="${size}" ` +
    `shape-rendering="crispEdges" role="img" aria-label="二维码">` +
    `<rect width="${total}" height="${total}" fill="#ffffff"/>` +
    `<path d="${path}" fill="#000000"/>` +
    `</svg>`
  );
}
