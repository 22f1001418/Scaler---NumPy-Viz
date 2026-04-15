/**
 * NumPy-like matrix ops in TypeScript + parse utility for user input.
 */

export type Matrix = number[][];
export type Vector = number[];

// ── PRNG ──────────────────────────────────────────────────
function splitmix32(a: number) {
  return () => {
    a |= 0; a = (a + 0x9e3779b9) | 0;
    let t = a ^ (a >>> 16); t = Math.imul(t, 0x21f0aaad);
    t = t ^ (t >>> 15); t = Math.imul(t, 0x735a2d97);
    return ((t = t ^ (t >>> 15)) >>> 0) / 4294967296;
  };
}
export function seededRandom(seed: number) {
  const rng = splitmix32(seed);
  return { random: () => rng(), randint: (lo: number, hi: number) => Math.floor(rng() * (hi - lo)) + lo };
}

// ── Creation ──────────────────────────────────────────────
export const zeros = (r: number, c: number): Matrix => Array.from({ length: r }, () => Array(c).fill(0));
export const arange = (start: number, stop: number, step = 1): Vector => {
  const out: number[] = []; for (let i = start; i < stop; i += step) out.push(i); return out;
};
export const randMatrix = (r: number, c: number, lo: number, hi: number, seed: number): Matrix => {
  const { randint } = seededRandom(seed);
  return Array.from({ length: r }, () => Array.from({ length: c }, () => randint(lo, hi)));
};
export const randVector = (n: number, lo: number, hi: number, seed: number): Vector => {
  const { randint } = seededRandom(seed); return Array.from({ length: n }, () => randint(lo, hi));
};

// ── Parse user input ──────────────────────────────────────
/**
 * Parse text into a Matrix. Accepts:
 *   [[1,2],[3,4]]   — JSON / NumPy-like
 *   1 2\n3 4        — space/tab separated rows
 *   1,2\n3,4        — CSV rows
 * Returns { ok: true, data } or { ok: false, error }.
 */
export function parseMatrix(text: string): { ok: true; data: Matrix } | { ok: false; error: string } {
  const trimmed = text.trim();
  if (!trimmed) return { ok: false, error: "Empty input" };

  // Try JSON parse first
  try {
    const parsed = JSON.parse(trimmed);
    if (Array.isArray(parsed)) {
      // 1-D → wrap
      if (parsed.length > 0 && typeof parsed[0] === "number") {
        if (parsed.every((x: any) => typeof x === "number" && isFinite(x)))
          return { ok: true, data: [parsed as number[]] };
      }
      // 2-D
      if (parsed.every((row: any) => Array.isArray(row) && row.every((x: any) => typeof x === "number" && isFinite(x)))) {
        const cols = (parsed[0] as number[]).length;
        if (parsed.every((row: any) => row.length === cols))
          return { ok: true, data: parsed as Matrix };
        return { ok: false, error: "Rows have different lengths" };
      }
    }
  } catch { /* not JSON, try text formats */ }

  // Text rows
  const lines = trimmed.split(/\n/).map((l) => l.trim()).filter(Boolean);
  const rows: number[][] = [];
  for (const line of lines) {
    // Remove brackets, split on comma/space/tab
    const clean = line.replace(/[\[\]()]/g, "").trim();
    const nums = clean.split(/[,\s\t]+/).filter(Boolean).map(Number);
    if (nums.some(isNaN)) return { ok: false, error: `Invalid number in: "${line}"` };
    rows.push(nums);
  }
  if (rows.length === 0) return { ok: false, error: "No numbers found" };
  const cols = rows[0].length;
  if (!rows.every((r) => r.length === cols)) return { ok: false, error: "Rows have different lengths" };
  return { ok: true, data: rows };
}

// ── Shape ─────────────────────────────────────────────────
export const shape = (m: Matrix): [number, number] => [m.length, m[0]?.length ?? 0];
export const reshape = (flat: Vector, r: number, c: number): Matrix => {
  const out: Matrix = [];
  for (let i = 0; i < r; i++) out.push(flat.slice(i * c, (i + 1) * c));
  return out;
};
export const flatten = (m: Matrix): Vector => m.flat();
export const transpose = (m: Matrix): Matrix => {
  const [r, c] = shape(m);
  return Array.from({ length: c }, (_, j) => Array.from({ length: r }, (_, i) => m[i][j]));
};

// ── Element-wise ──────────────────────────────────────────
type BinOp = (a: number, b: number) => number;
const ewise = (a: Matrix, b: Matrix, fn: BinOp): Matrix => a.map((row, i) => row.map((v, j) => fn(v, b[i][j])));
export const add      = (a: Matrix, b: Matrix) => ewise(a, b, (x, y) => x + y);
export const subtract = (a: Matrix, b: Matrix) => ewise(a, b, (x, y) => x - y);
export const multiply = (a: Matrix, b: Matrix) => ewise(a, b, (x, y) => x * y);
export const divide   = (a: Matrix, b: Matrix) => ewise(a, b, (x, y) => y ? x / y : NaN);
export const power    = (a: Matrix, b: Matrix) => ewise(a, b, (x, y) => Math.pow(x, y));
export const mod      = (a: Matrix, b: Matrix) => ewise(a, b, (x, y) => x % y);
export const greater  = (a: Matrix, b: Matrix) => ewise(a, b, (x, y) => x > y ? 1 : 0);
export const scalarOp = (m: Matrix, s: number, fn: BinOp): Matrix => m.map((row) => row.map((v) => fn(v, s)));

// ── Matmul ────────────────────────────────────────────────
export function matmul(a: Matrix, b: Matrix): Matrix {
  const [rA, cA] = shape(a); const [, cB] = shape(b); const out = zeros(rA, cB);
  for (let i = 0; i < rA; i++) for (let j = 0; j < cB; j++) for (let k = 0; k < cA; k++) out[i][j] += a[i][k] * b[k][j];
  return out;
}
export const dot = (a: Vector, b: Vector): number => a.reduce((s, v, i) => s + v * b[i], 0);

// ── Aggregations ──────────────────────────────────────────
export function sumAxis(m: Matrix, axis: 0 | 1 | null): Vector | number {
  const [r, c] = shape(m);
  if (axis === null) return m.flat().reduce((s, v) => s + v, 0);
  if (axis === 0) return Array.from({ length: c }, (_, j) => m.reduce((s, row) => s + row[j], 0));
  return m.map((row) => row.reduce((s, v) => s + v, 0));
}
export function meanAxis(m: Matrix, axis: 0 | 1 | null): Vector | number {
  const [r, c] = shape(m); const s = sumAxis(m, axis);
  if (axis === null) return (s as number) / (r * c);
  if (axis === 0) return (s as Vector).map((v) => v / r);
  return (s as Vector).map((v) => v / c);
}
export function maxAxis(m: Matrix, axis: 0 | 1 | null): Vector | number {
  if (axis === null) return Math.max(...m.flat());
  if (axis === 0) return Array.from({ length: shape(m)[1] }, (_, j) => Math.max(...m.map((r) => r[j])));
  return m.map((row) => Math.max(...row));
}
export function minAxis(m: Matrix, axis: 0 | 1 | null): Vector | number {
  if (axis === null) return Math.min(...m.flat());
  if (axis === 0) return Array.from({ length: shape(m)[1] }, (_, j) => Math.min(...m.map((r) => r[j])));
  return m.map((row) => Math.min(...row));
}

// ── Slicing / stacking / sorting / cumulative ─────────────
export const slice2d = (m: Matrix, rS: number, rE: number, cS: number, cE: number): Matrix =>
  m.slice(rS, rE).map((r) => r.slice(cS, cE));

export function broadcastAdd(a: Matrix, b: Matrix): Matrix {
  const [rA, cA] = shape(a); const [rB, cB] = shape(b);
  const rO = Math.max(rA, rB); const cO = Math.max(cA, cB);
  const out = zeros(rO, cO);
  for (let i = 0; i < rO; i++) for (let j = 0; j < cO; j++) out[i][j] = a[i % rA][j % cA] + b[i % rB][j % cB];
  return out;
}
export const vstack = (a: Matrix, b: Matrix): Matrix => [...a.map((r) => [...r]), ...b.map((r) => [...r])];
export const hstack = (a: Matrix, b: Matrix): Matrix => a.map((row, i) => [...row, ...b[i]]);
export const sort = (v: Vector): Vector => [...v].sort((a, b) => a - b);
export const argsort = (v: Vector): Vector => v.map((_, i) => i).sort((a, b) => v[a] - v[b]);
export const cumsum = (v: Vector): Vector => { const o: Vector = []; let s = 0; for (const x of v) { s += x; o.push(s); } return o; };
export const cumprod = (v: Vector): Vector => { const o: Vector = []; let p = 1; for (const x of v) { p *= x; o.push(p); } return o; };
export const diff = (v: Vector): Vector => v.slice(1).map((x, i) => x - v[i]);

// ── Format ────────────────────────────────────────────────
export const fmt = (n: number, d = 1): string => {
  if (Number.isNaN(n)) return "—";
  if (!Number.isFinite(n)) return "∞";
  return Number.isInteger(n) ? n.toString() : n.toFixed(d);
};

/** Returns 0–4 intensity bucket for heatmap coloring */
export function heatLevel(val: number, min: number, max: number): number {
  if (Number.isNaN(val) || min === max) return 0;
  const t = (val - min) / (max - min);
  return Math.min(4, Math.floor(t * 5));
}

// ── Validation ─────────────────────────────────────────────
/**
 * Validates that two matrices have the same shape (required for element-wise ops)
 */
export function validateShapesEqual(a: Matrix, b: Matrix): { ok: true } | { ok: false; error: string } {
  const [rA, cA] = shape(a);
  const [rB, cB] = shape(b);
  if (rA !== rB || cA !== cB) {
    return { ok: false, error: `Shape mismatch: A is (${rA}×${cA}) but B is (${rB}×${cB}). Element-wise operations require identical shapes.` };
  }
  return { ok: true };
}

/**
 * Validates that two matrices can be multiplied (A.cols === B.rows)
 */
export function validateMatmulCompatible(a: Matrix, b: Matrix): { ok: true } | { ok: false; error: string } {
  const [rA, cA] = shape(a);
  const [rB, cB] = shape(b);
  if (cA !== rB) {
    return { ok: false, error: `Matmul incompatible: A has ${cA} columns but B has ${rB} rows. For A @ B, columns of A must equal rows of B.` };
  }
  return { ok: true };
}

/**
 * Validates that two matrices can be vstacked (same number of columns)
 */
export function validateVstackCompatible(a: Matrix, b: Matrix): { ok: true } | { ok: false; error: string } {
  const [, cA] = shape(a);
  const [, cB] = shape(b);
  if (cA !== cB) {
    return { ok: false, error: `vstack incompatible: A has ${cA} columns but B has ${cB} columns. Both must have the same number of columns.` };
  }
  return { ok: true };
}

/**
 * Validates that two matrices can be hstacked (same number of rows)
 */
export function validateHstackCompatible(a: Matrix, b: Matrix): { ok: true } | { ok: false; error: string } {
  const [rA] = shape(a);
  const [rB] = shape(b);
  if (rA !== rB) {
    return { ok: false, error: `hstack incompatible: A has ${rA} rows but B has ${rB} rows. Both must have the same number of rows.` };
  }
  return { ok: true };
}

/**
 * Validates that two matrices can be broadcast (no dimension mismatch)
 */
export function validateBroadcastCompatible(a: Matrix, b: Matrix): { ok: true } | { ok: false; error: string } {
  const [rA, cA] = shape(a);
  const [rB, cB] = shape(b);
  
  // Broadcasting is compatible if:
  // 1. Shapes are identical, OR
  // 2. One dimension is 1 (can be stretched), OR
  // 3. One array has fewer dimensions (can be treated as 1xN or Nx1)
  
  const maxRows = Math.max(rA, rB);
  const maxCols = Math.max(cA, cB);
  
  // Check if dimensions are compatible
  const rowCompatible = (rA === 1 || rB === 1 || rA === rB);
  const colCompatible = (cA === 1 || cB === 1 || cA === cB);
  
  if (!rowCompatible || !colCompatible) {
    return { ok: false, error: `Broadcasting incompatible: A (${rA}×${cA}) and B (${rB}×${cB}) cannot be broadcast together. Dimensions must match or be 1.` };
  }
  
  return { ok: true };
}
