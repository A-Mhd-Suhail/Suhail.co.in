import * as THREE from "three";
import { EARTH_LAND } from "./earthLand";

/**
 * Procedural planet and sky textures, drawn in code from the Natural Earth coastlines and layered noise.
 * Everything is generated once, in small slices that yield to the browser, and disposed with the scene.
 * Nothing here loads an image file.
 */

const tick = () => new Promise<void>((r) => setTimeout(r, 0));
/** Hands control back to the browser whenever ~7ms have passed, so generation never forms a long task. */
let sliceStart = 0;
const maybeYield = async () => {
  const now = performance.now();
  if (!sliceStart) sliceStart = now;
  if (now - sliceStart > 7) {
    await tick();
    sliceStart = performance.now();
  }
};

function mulberry32(seed: number) {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/** Value noise that wraps horizontally, so equirectangular maps have no seam. */
function makeNoise(seed: number, cellsX: number, cellsY: number) {
  const r = mulberry32(seed);
  const grid = new Float32Array(cellsX * (cellsY + 2));
  for (let i = 0; i < grid.length; i++) grid[i] = r();
  const at = (x: number, y: number) => grid[y * cellsX + (((x % cellsX) + cellsX) % cellsX)];
  const sm = (t: number) => t * t * (3 - 2 * t);
  return (u: number, v: number) => {
    const x = u * cellsX;
    const y = v * cellsY;
    const x0 = Math.floor(x);
    const y0 = Math.floor(y);
    const fx = sm(x - x0);
    const fy = sm(y - y0);
    const a = at(x0, y0) + (at(x0 + 1, y0) - at(x0, y0)) * fx;
    const b = at(x0, y0 + 1) + (at(x0 + 1, y0 + 1) - at(x0, y0 + 1)) * fx;
    return a + (b - a) * fy;
  };
}
type Noise = (u: number, v: number) => number;

function fbm(ns: Noise[], u: number, v: number) {
  let s = 0;
  let a = 0.5;
  let n = 0;
  for (const f of ns) {
    s += f(u, v) * a;
    n += a;
    a *= 0.5;
  }
  return s / n;
}

const clamp01 = (v: number) => (v < 0 ? 0 : v > 1 ? 1 : v);
const smoothstep = (a: number, b: number, x: number) => {
  const t = clamp01((x - a) / (b - a));
  return t * t * (3 - 2 * t);
};
const mix = (a: number, b: number, t: number) => a + (b - a) * t;
type RGB = [number, number, number];
const mixC = (a: RGB, b: RGB, t: number): RGB => [mix(a[0], b[0], t), mix(a[1], b[1], t), mix(a[2], b[2], t)];
const hex = (h: string): RGB => [parseInt(h.slice(1, 3), 16), parseInt(h.slice(3, 5), 16), parseInt(h.slice(5, 7), 16)];

function makeCanvas(w: number, h: number) {
  const c = document.createElement("canvas");
  c.width = w;
  c.height = h;
  return c;
}

/** Separable box blur on a Float32 field, wrapping horizontally. */
function blur(src: Float32Array, W: number, H: number, r: number) {
  const tmp = new Float32Array(W * H);
  const out = new Float32Array(W * H);
  const k = 1 / (2 * r + 1);
  for (let y = 0; y < H; y++) {
    let acc = 0;
    for (let x = -r; x <= r; x++) acc += src[y * W + ((x + W) % W)];
    for (let x = 0; x < W; x++) {
      tmp[y * W + x] = acc * k;
      acc += src[y * W + ((x + r + 1) % W)] - src[y * W + ((x - r + W) % W)];
    }
  }
  for (let x = 0; x < W; x++) {
    let acc = 0;
    for (let y = -r; y <= r; y++) acc += tmp[Math.min(H - 1, Math.max(0, y)) * W + x];
    for (let y = 0; y < H; y++) {
      out[y * W + x] = acc * k;
      acc += tmp[Math.min(H - 1, y + r + 1) * W + x] - tmp[Math.max(0, y - r) * W + x];
    }
  }
  return out;
}

export interface EarthMaps {
  /** Day colour with hill shading baked in. */
  day: THREE.CanvasTexture;
  /** r = city lights, g = water mask (for the sun glint). */
  night: THREE.CanvasTexture;
  /** r = cloud cover. */
  cloud: THREE.CanvasTexture;
}

export async function makeEarthMaps(W = 2048): Promise<EarthMaps> {
  const H = W / 2;
  const k = W / 2048;

  // 1. Land mask from the real coastlines.
  const mc = makeCanvas(W, H);
  const mctx = mc.getContext("2d", { willReadFrequently: true })!;
  mctx.fillStyle = "#000";
  mctx.fillRect(0, 0, W, H);
  mctx.fillStyle = "#fff";
  mctx.scale(k, k);
  mctx.fill(new Path2D(EARTH_LAND));
  const md = mctx.getImageData(0, 0, W, H).data;
  const land = new Float32Array(W * H);
  for (let i = 0; i < W * H; i++) land[i] = md[i * 4] / 255;
  await tick();

  // Soft coast (for the shallow-water rim) and a wider one (for the continental shelf).
  const r1 = Math.max(1, Math.round(2 * k));
  const r2 = Math.max(2, Math.round(9 * k));
  const coast = blur(blur(land, W, H, r1), W, H, r1);
  await tick();
  const shelf = blur(blur(land, W, H, r2), W, H, r2);
  await tick();

  // 2. Height and colour.
  const nH = [makeNoise(11, 12, 6), makeNoise(23, 36, 18), makeNoise(37, 110, 55), makeNoise(53, 260, 130)];
  const nM = [makeNoise(71, 8, 4), makeNoise(83, 24, 12), makeNoise(97, 70, 35)];
  const height = new Float32Array(W * H);
  const dayC = makeCanvas(W, H);
  const dctx = dayC.getContext("2d")!;
  const dimg = dctx.createImageData(W, H);
  const dd = dimg.data;

  const deep = hex("#06203d");
  const mid = hex("#0b3358");
  const shallow = hex("#2a7a8f");
  const sand = hex("#b59d70");
  const dry = hex("#8f8660");
  const steppe = hex("#6c7b49");
  const forest = hex("#2f4a2d");
  const jungle = hex("#24442a");
  const tundra = hex("#80846c");
  const rock = hex("#786d5f");
  const ice = hex("#e6ecef");

  // Heights first (needed for hill shading), in slices.
  for (let y = 0; y < H; y++) {
    {
      const v = y / H;
      for (let x = 0; x < W; x++) {
        const i = y * W + x;
        const f = fbm(nH, x / W, v);
        // Mountains where ridged noise is high, softened near coasts.
        const ridge = 1 - Math.abs(fbm([nH[1], nH[2], nH[3]], x / W + 0.3, v) * 2 - 1);
        height[i] = land[i] > 0.5 ? clamp01(0.18 + f * 0.55 + Math.pow(ridge, 3) * 0.4 * smoothstep(0.35, 0.75, f)) * smoothstep(0.35, 0.9, coast[i]) : 0;
      }
    }
    await maybeYield();
  }

  for (let y = 0; y < H; y++) {
    {
      const v = y / H;
      const lat = (0.5 - v) * Math.PI;
      const alat = Math.abs(lat);
      for (let x = 0; x < W; x++) {
        const i = y * W + x;
        const u = x / W;
        let c: RGB;
        if (land[i] > 0.5) {
          const h = height[i];
          const m = fbm(nM, u, v);
          const dryness = smoothstep(0.1, 0.55, alat) * (1 - smoothstep(0.55, 0.95, alat)); // subtropical belt
          let col = mixC(steppe, forest, smoothstep(0.42, 0.62, m));
          col = mixC(col, jungle, smoothstep(0.5, 0.9, m) * (1 - smoothstep(0.18, 0.5, alat)));
          col = mixC(col, mixC(dry, sand, smoothstep(0.35, 0.7, 1 - m)), dryness * smoothstep(0.38, 0.62, 1 - m) * 0.95);
          col = mixC(col, tundra, smoothstep(0.95, 1.2, alat));
          col = mixC(col, rock, smoothstep(0.52, 0.78, h));
          col = mixC(col, ice, Math.max(smoothstep(1.2, 1.38, alat), smoothstep(0.82, 0.96, h) * 0.9));
          // Hill shading, light from the upper left.
          const h0 = height[Math.max(0, y - 1) * W + ((x - 1 + W) % W)];
          const h1 = height[Math.min(H - 1, y + 1) * W + ((x + 1) % W)];
          const shade = 1 + clamp01(Math.abs(h0 - h1) * 8) * Math.sign(h0 - h1) * 0.42;
          const k = 0.86 + 0.28 * fbm([nH[2], nH[3]], u, v);
          c = [col[0] * shade * k, col[1] * shade * k, col[2] * shade * k];
        } else {
          const depth = smoothstep(0.0, 0.5, shelf[i]);
          let col = mixC(deep, mid, 0.5 + 0.5 * Math.sin(lat * 2) * 0.4 + fbm([nM[1], nM[2]], u, v) * 0.5 - 0.25);
          col = mixC(col, shallow, smoothstep(0.08, 0.5, depth) * 0.55 + smoothstep(0.04, 0.4, coast[i]) * 0.45);
          // Polar sea ice.
          col = mixC(col, ice, smoothstep(1.32, 1.5, alat) * 0.9);
          c = col;
        }
        const o = i * 4;
        dd[o] = c[0];
        dd[o + 1] = c[1];
        dd[o + 2] = c[2];
        dd[o + 3] = 255;
      }
    }
    await maybeYield();
  }
  dctx.putImageData(dimg, 0, 0);

  // 3. Night lights and water mask.
  const nightC = makeCanvas(W, H);
  const nctx = nightC.getContext("2d")!;
  const nimg = nctx.createImageData(W, H);
  const nd = nimg.data;
  const nC = [makeNoise(131, 40, 20), makeNoise(149, 150, 75), makeNoise(167, 400, 200)];
  for (let y = 0; y < H; y++) {
    {
      const v = y / H;
      const alat = Math.abs((0.5 - v) * Math.PI);
      const band = smoothstep(1.15, 0.75, alat) * smoothstep(0.02, 0.2, alat + 0.1);
      for (let x = 0; x < W; x++) {
        const i = y * W + x;
        const u = x / W;
        let lights = 0;
        if (land[i] > 0.5 && height[i] < 0.62) {
          const pop = smoothstep(0.5, 0.74, nC[0](u, v) * 0.6 + nC[1](u, v) * 0.4);
          const spark = smoothstep(0.55, 0.9, nC[2](u, v));
          lights = pop * (0.25 + spark * 0.75) * band;
        }
        const o = i * 4;
        nd[o] = Math.min(255, lights * 330);
        nd[o + 1] = (1 - land[i]) * 255;
        nd[o + 2] = 0;
        nd[o + 3] = 255;
      }
    }
    await maybeYield();
  }
  nctx.putImageData(nimg, 0, 0);

  // 4. Clouds: warped noise, fewer in the subtropics, more at the equator and the storm tracks.
  const cloudC = makeCanvas(W, H);
  const cctx = cloudC.getContext("2d")!;
  const cimg = cctx.createImageData(W, H);
  const cd = cimg.data;
  const nW = makeNoise(201, 10, 5);
  const nCl = [makeNoise(211, 12, 6), makeNoise(223, 30, 15), makeNoise(239, 72, 36), makeNoise(251, 150, 75)];
  for (let y = 0; y < H; y++) {
    {
      const v = y / H;
      const lat = (0.5 - v) * Math.PI;
      const band = 0.62 + 0.5 * Math.cos(lat * 3.6 - 0.4) * Math.cos(lat * 0.9);
      for (let x = 0; x < W; x++) {
        const u = x / W;
        const wu = u + (nW(u, v) - 0.5) * 0.05;
        const wv = v + (nW(u + 0.5, v) - 0.5) * 0.03;
        const f = fbm(nCl, wu, wv) * band;
        // Fewer clouds over dry subtropical land (the Sahara, Arabia, Australia) than over oceans and the tropics.
        const dry = land[y * W + x] > 0.5 ? smoothstep(0.1, 0.35, Math.abs(lat)) * (1 - smoothstep(0.55, 0.8, Math.abs(lat))) : 0;
        const c = smoothstep(0.53, 0.68, f * (1 - dry * 0.38)) * 0.95;
        const o = (y * W + x) * 4;
        cd[o] = c * 255;
        cd[o + 1] = c * 255;
        cd[o + 2] = c * 255;
        cd[o + 3] = 255;
      }
    }
    await maybeYield();
  }
  cctx.putImageData(cimg, 0, 0);

  const day = new THREE.CanvasTexture(dayC);
  day.colorSpace = THREE.SRGBColorSpace;
  day.anisotropy = 8;
  const night = new THREE.CanvasTexture(nightC);
  const cloud = new THREE.CanvasTexture(cloudC);
  for (const t of [night, cloud]) t.anisotropy = 4;
  return { day, night, cloud };
}

function craters(ctx: CanvasRenderingContext2D, W: number, H: number, count: number, seed: number, minR: number, maxR: number, strength = 1) {
  const r = mulberry32(seed);
  for (let i = 0; i < count; i++) {
    const radius = minR + Math.pow(r(), 3.2) * (maxR - minR);
    const x = r() * W;
    const y = H * 0.08 + r() * H * 0.84;
    for (const ox of [-W, 0, W]) {
      const cx = x + ox;
      if (cx + radius < 0 || cx - radius > W) continue;
      const g = ctx.createRadialGradient(cx + radius * 0.18, y + radius * 0.18, radius * 0.15, cx, y, radius);
      g.addColorStop(0, `rgba(18,18,18,${0.3 * strength})`);
      g.addColorStop(0.78, `rgba(18,18,18,${0.16 * strength})`);
      g.addColorStop(1, "rgba(18,18,18,0)");
      ctx.fillStyle = g;
      ctx.beginPath();
      ctx.arc(cx, y, radius, 0, Math.PI * 2);
      ctx.fill();
      ctx.lineWidth = Math.max(0.7, radius * 0.1);
      ctx.strokeStyle = `rgba(235,235,230,${0.22 * strength})`;
      ctx.beginPath();
      ctx.arc(cx, y, radius * 0.96, Math.PI * 0.95, Math.PI * 1.7);
      ctx.stroke();
    }
  }
}

/** A cratered rocky world. `tint` shifts the regolith colour; `maria` adds large dark plains. */
export async function makeRockTexture(opts: { tint: RGB; mare: number; craters: number; seed: number; size?: number }): Promise<THREE.CanvasTexture> {
  const W = opts.size ?? 1024;
  const H = W / 2;
  const k = W / 1024;
  const c = makeCanvas(W, H);
  const ctx = c.getContext("2d")!;
  const img = ctx.createImageData(W, H);
  const d = img.data;
  const n = [makeNoise(opts.seed, 8, 4), makeNoise(opts.seed + 4, 26, 13), makeNoise(opts.seed + 9, 80, 40), makeNoise(opts.seed + 15, 220, 110)];
  for (let y = 0; y < H; y++) {
    {
      const v = y / H;
      for (let x = 0; x < W; x++) {
        const f = fbm(n, x / W, v);
        const mare = Math.max(0, fbm([n[0], n[1]], x / W + 0.37, v) - 0.55) * 2.4 * opts.mare;
        const k = 0.62 + 0.75 * f - mare * 0.42;
        const o = (y * W + x) * 4;
        d[o] = Math.min(255, opts.tint[0] * k);
        d[o + 1] = Math.min(255, opts.tint[1] * k);
        d[o + 2] = Math.min(255, opts.tint[2] * k);
        d[o + 3] = 255;
      }
    }
    await maybeYield();
  }
  ctx.putImageData(img, 0, 0);
  craters(ctx, W, H, 14, opts.seed + 1, 22 * k, 56 * k);
  craters(ctx, W, H, Math.round(opts.craters * 0.25 * Math.max(0.4, k)), opts.seed + 2, 6 * k, 22 * k);
  craters(ctx, W, H, Math.round(opts.craters * Math.max(0.3, k)), opts.seed + 3, Math.max(1.2, 2 * k), 8 * k);
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  t.wrapS = THREE.RepeatWrapping;
  t.anisotropy = 8;
  return t;
}

/** Tiling relief used as a bump map so surfaces still read up close. */
export function makeDetailBump(): THREE.CanvasTexture {
  const S = 256;
  const c = makeCanvas(S, S);
  const ctx = c.getContext("2d")!;
  const img = ctx.createImageData(S, S);
  const d = img.data;
  const n = [makeNoise(3, 8, 8), makeNoise(7, 24, 24), makeNoise(13, 64, 64)];
  for (let y = 0; y < S; y++) {
    for (let x = 0; x < S; x++) {
      const k = 255 * fbm(n, x / S, y / S);
      const o = (y * S + x) * 4;
      d[o] = d[o + 1] = d[o + 2] = k;
      d[o + 3] = 255;
    }
  }
  ctx.putImageData(img, 0, 0);
  craters(ctx, S, S, 22, 404, 3, 16);
  const t = new THREE.CanvasTexture(c);
  t.wrapS = t.wrapT = THREE.RepeatWrapping;
  t.repeat.set(10, 5);
  return t;
}

/** A calm banded giant. */
export async function makeGasTexture(palette: string[], seed: number, W = 1024): Promise<THREE.CanvasTexture> {
  const H = W / 2;
  const c = makeCanvas(W, H);
  const ctx = c.getContext("2d")!;
  const img = ctx.createImageData(W, H);
  const d = img.data;
  const cols = palette.map(hex);
  const nb = makeNoise(seed, 1, 28);
  const nw = [makeNoise(seed + 3, 6, 6), makeNoise(seed + 5, 20, 20), makeNoise(seed + 8, 60, 60)];
  for (let y = 0; y < H; y++) {
    {
      const v = y / H;
      for (let x = 0; x < W; x++) {
        const u = x / W;
        const warp = (fbm(nw, u, v) - 0.5) * 0.14;
        const b = nb(0, clamp01(v + warp));
        const p = b * (cols.length - 1);
        const i0 = Math.floor(p);
        const col = mixC(cols[i0], cols[Math.min(cols.length - 1, i0 + 1)], p - i0);
        const streak = 0.9 + 0.2 * fbm([nw[1], nw[2]], u * 1.0, v * 0.6);
        const o = (y * W + x) * 4;
        d[o] = col[0] * streak;
        d[o + 1] = col[1] * streak;
        d[o + 2] = col[2] * streak;
        d[o + 3] = 255;
      }
    }
    await maybeYield();
  }
  ctx.putImageData(img, 0, 0);
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  t.anisotropy = 4;
  return t;
}

/** A thin planetary ring, mapped radially (u = inner edge to outer edge). */
export function makeRingTexture(): THREE.CanvasTexture {
  const c = makeCanvas(512, 4);
  const ctx = c.getContext("2d")!;
  const r = mulberry32(77);
  const g = ctx.createLinearGradient(0, 0, 512, 0);
  const stops = 40;
  for (let i = 0; i <= stops; i++) {
    const p = i / stops;
    const edge = Math.sin(p * Math.PI);
    g.addColorStop(p, `rgba(214,222,232,${(0.05 + r() * 0.4) * edge})`);
  }
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, 512, 4);
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  return t;
}

/** Deep-space backdrop (equirectangular): faint nebulae, a dim Milky Way band and a few distant galaxies. */
export async function makeSpaceBackdrop(W = 1024): Promise<THREE.CanvasTexture> {
  const H = W / 2;
  const c = makeCanvas(W, H);
  const ctx = c.getContext("2d")!;
  const img = ctx.createImageData(W, H);
  const d = img.data;
  const n1 = [makeNoise(301, 4, 2), makeNoise(311, 9, 4), makeNoise(321, 20, 10), makeNoise(331, 44, 22)];
  const n2 = [makeNoise(341, 5, 3), makeNoise(353, 12, 6), makeNoise(367, 28, 14)];
  const fine = [makeNoise(373, 90, 45), makeNoise(379, 200, 100), makeNoise(383, 400, 200)];
  const blue: RGB = [34, 78, 170];
  const teal: RGB = [18, 120, 140];
  const violet: RGB = [96, 54, 150];
  for (let y = 0; y < H; y++) {
    {
      const v = y / H;
      for (let x = 0; x < W; x++) {
        const u = x / W;
        const a = smoothstep(0.52, 0.86, fbm(n1, u, v));
        const b = smoothstep(0.55, 0.88, fbm(n2, u + 0.43, v + 0.1));
        // Milky Way: a tilted band of fine grain.
        const centre = 0.5 + 0.17 * Math.sin(u * Math.PI * 2 + 1.1);
        const dist = (v - centre) / 0.11;
        const band = Math.exp(-dist * dist);
        const grain = smoothstep(0.35, 0.8, fbm(fine, u, v));
        let r = 0;
        let g = 0;
        let bl = 0;
        let al = 0;
        const na = a * 0.1;
        r += blue[0] * na;
        g += blue[1] * na;
        bl += blue[2] * na;
        al += na;
        const nb = b * 0.075;
        r += (violet[0] * 0.6 + teal[0] * 0.4) * nb;
        g += (violet[1] * 0.6 + teal[1] * 0.4) * nb;
        bl += (violet[2] * 0.6 + teal[2] * 0.4) * nb;
        al += nb;
        const nm = band * (0.05 + grain * 0.1);
        r += 205 * nm;
        g += 214 * nm;
        bl += 235 * nm;
        al += nm;
        const o = (y * W + x) * 4;
        // Premultiplied-style accumulation, normalised so low alpha keeps the colour.
        const inv = al > 0.0001 ? 1 / al : 0;
        d[o] = Math.min(255, r * inv);
        d[o + 1] = Math.min(255, g * inv);
        d[o + 2] = Math.min(255, bl * inv);
        d[o + 3] = Math.min(255, al * 255);
      }
    }
    await maybeYield();
  }
  ctx.putImageData(img, 0, 0);

  // A few small distant galaxies.
  const r = mulberry32(555);
  for (let i = 0; i < 7; i++) {
    const x = r() * W;
    const y = H * (0.15 + r() * 0.7);
    const rad = 4 + r() * 7;
    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(r() * Math.PI);
    ctx.scale(1, 0.38);
    const g = ctx.createRadialGradient(0, 0, 0, 0, 0, rad);
    g.addColorStop(0, "rgba(255,240,220,0.55)");
    g.addColorStop(0.35, "rgba(190,205,255,0.2)");
    g.addColorStop(1, "rgba(120,140,220,0)");
    ctx.fillStyle = g;
    ctx.beginPath();
    ctx.arc(0, 0, rad, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }

  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  t.wrapS = THREE.RepeatWrapping;
  return t;
}
