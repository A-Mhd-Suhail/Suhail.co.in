import * as THREE from "three";
import { EARTH_LAND } from "./earthLand";

/** Small deterministic generator so the planets look the same on every visit. */
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

/** Value noise on a lattice that wraps horizontally, so equirectangular textures have no seam. */
function makeNoise(seed: number, cellsX: number, cellsY: number) {
  const r = mulberry32(seed);
  const grid = new Float32Array(cellsX * (cellsY + 1));
  for (let i = 0; i < grid.length; i++) grid[i] = r();
  const at = (x: number, y: number) => grid[y * cellsX + (((x % cellsX) + cellsX) % cellsX)];
  const smooth = (t: number) => t * t * (3 - 2 * t);
  return (u: number, v: number) => {
    const x = u * cellsX;
    const y = v * cellsY;
    const x0 = Math.floor(x);
    const y0 = Math.floor(y);
    const fx = smooth(x - x0);
    const fy = smooth(y - y0);
    const a = at(x0, y0) + (at(x0 + 1, y0) - at(x0, y0)) * fx;
    const b = at(x0, y0 + 1) + (at(x0 + 1, y0 + 1) - at(x0, y0 + 1)) * fx;
    return a + (b - a) * fy;
  };
}

function fbm(noises: ((u: number, v: number) => number)[], u: number, v: number) {
  let sum = 0;
  let amp = 0.5;
  let norm = 0;
  for (const n of noises) {
    sum += n(u, v) * amp;
    norm += amp;
    amp *= 0.5;
  }
  return sum / norm;
}

function canvas(w: number, h: number) {
  const c = document.createElement("canvas");
  c.width = w;
  c.height = h;
  return c;
}

/** Earth: ocean and land from real coastlines, tinted by latitude and broken up with fine noise. */
export function makeEarthTexture(): THREE.CanvasTexture {
  const W = 2048;
  const H = 1024;
  const c = canvas(W, H);
  const ctx = c.getContext("2d")!;

  const sea = ctx.createLinearGradient(0, 0, 0, H);
  sea.addColorStop(0, "#0d2c4d");
  sea.addColorStop(0.5, "#0a3358");
  sea.addColorStop(1, "#0d2c4d");
  ctx.fillStyle = sea;
  ctx.fillRect(0, 0, W, H);

  const land = new Path2D(EARTH_LAND);
  // Shallow water along the coasts.
  ctx.lineJoin = "round";
  ctx.lineWidth = 7;
  ctx.strokeStyle = "rgba(70, 140, 175, 0.38)";
  ctx.stroke(land);

  // Land colour by latitude: ice, tundra, forest, dry subtropics, tropics, forest, ice.
  const ground = ctx.createLinearGradient(0, 0, 0, H);
  ground.addColorStop(0, "#d9dde0");
  ground.addColorStop(0.1, "#aeb39f");
  ground.addColorStop(0.22, "#4f6446");
  ground.addColorStop(0.33, "#6c7a52");
  ground.addColorStop(0.42, "#a3956a");
  ground.addColorStop(0.5, "#4d6d3f");
  ground.addColorStop(0.6, "#8d8b62");
  ground.addColorStop(0.72, "#5a7046");
  ground.addColorStop(0.86, "#b9bfb5");
  ground.addColorStop(1, "#e6e8ea");
  ctx.fillStyle = ground;
  ctx.fill(land);
  ctx.lineWidth = 1.2;
  ctx.strokeStyle = "rgba(20, 30, 20, 0.35)";
  ctx.stroke(land);

  // Break up flat colour with fine, wrapping noise.
  const n = [makeNoise(11, 16, 8), makeNoise(23, 48, 24), makeNoise(37, 140, 70)];
  const img = ctx.getImageData(0, 0, W, H);
  const d = img.data;
  for (let y = 0; y < H; y++) {
    const v = y / H;
    for (let x = 0; x < W; x++) {
      const k = 0.82 + 0.36 * fbm(n, x / W, v);
      const i = (y * W + x) * 4;
      d[i] *= k;
      d[i + 1] *= k;
      d[i + 2] *= k;
    }
  }
  ctx.putImageData(img, 0, 0);

  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  t.anisotropy = 4;
  return t;
}

function drawCraters(ctx: CanvasRenderingContext2D, W: number, H: number, count: number, seed: number, minR: number, maxR: number) {
  const r = mulberry32(seed);
  for (let i = 0; i < count; i++) {
    const radius = minR + Math.pow(r(), 3.2) * (maxR - minR);
    const x = r() * W;
    const y = H * 0.06 + r() * H * 0.88;
    for (const ox of [-W, 0, W]) {
      const cx = x + ox;
      if (cx + radius < 0 || cx - radius > W) continue;
      // Dark floor, lit on the upper-left rim.
      const g = ctx.createRadialGradient(cx + radius * 0.18, y + radius * 0.18, radius * 0.15, cx, y, radius);
      g.addColorStop(0, "rgba(20,20,20,0.34)");
      g.addColorStop(0.78, "rgba(20,20,20,0.18)");
      g.addColorStop(1, "rgba(20,20,20,0)");
      ctx.fillStyle = g;
      ctx.beginPath();
      ctx.arc(cx, y, radius, 0, Math.PI * 2);
      ctx.fill();
      ctx.lineWidth = Math.max(0.8, radius * 0.1);
      ctx.strokeStyle = "rgba(235,235,230,0.24)";
      ctx.beginPath();
      ctx.arc(cx, y, radius * 0.96, Math.PI * 0.95, Math.PI * 1.7);
      ctx.stroke();
      ctx.strokeStyle = "rgba(10,10,10,0.22)";
      ctx.beginPath();
      ctx.arc(cx, y, radius * 0.96, Math.PI * 1.95, Math.PI * 2.7);
      ctx.stroke();
    }
  }
}

/** Moon: grey regolith, dark maria and a scatter of craters. Used as colour map. */
export function makeMoonTexture(): THREE.CanvasTexture {
  const W = 2048;
  const H = 1024;
  const c = canvas(W, H);
  const ctx = c.getContext("2d")!;
  ctx.fillStyle = "#8a8985";
  ctx.fillRect(0, 0, W, H);

  const n = [makeNoise(5, 10, 5), makeNoise(9, 32, 16), makeNoise(14, 96, 48), makeNoise(21, 256, 128)];
  const img = ctx.getImageData(0, 0, W, H);
  const d = img.data;
  for (let y = 0; y < H; y++) {
    const v = y / H;
    for (let x = 0; x < W; x++) {
      const f = fbm(n, x / W, v);
      const mare = Math.max(0, fbm([n[0], n[1]], x / W + 0.37, v) - 0.55) * 2.4; // dark plains
      const k = 0.66 + 0.7 * f - mare * 0.42;
      const i = (y * W + x) * 4;
      d[i] = Math.min(255, d[i] * k);
      d[i + 1] = Math.min(255, d[i + 1] * k);
      d[i + 2] = Math.min(255, d[i + 2] * (k * 0.97));
    }
  }
  ctx.putImageData(img, 0, 0);

  drawCraters(ctx, W, H, 36, 101, 36, 90);
  drawCraters(ctx, W, H, 260, 202, 10, 38);
  drawCraters(ctx, W, H, 900, 303, 3, 12);

  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  t.wrapS = THREE.RepeatWrapping;
  t.anisotropy = 8;
  return t;
}

/** Fine, tiling relief used as bump map so the surface still reads when the camera is close. */
export function makeMoonDetail(): THREE.CanvasTexture {
  const S = 512;
  const c = canvas(S, S);
  const ctx = c.getContext("2d")!;
  ctx.fillStyle = "#808080";
  ctx.fillRect(0, 0, S, S);
  const n = [makeNoise(3, 8, 8), makeNoise(7, 24, 24), makeNoise(13, 64, 64), makeNoise(19, 128, 128)];
  const img = ctx.getImageData(0, 0, S, S);
  const d = img.data;
  for (let y = 0; y < S; y++) {
    for (let x = 0; x < S; x++) {
      const k = 255 * fbm(n, x / S, y / S);
      const i = (y * S + x) * 4;
      d[i] = d[i + 1] = d[i + 2] = k;
    }
  }
  ctx.putImageData(img, 0, 0);
  drawCraters(ctx, S, S, 40, 404, 4, 26);
  const t = new THREE.CanvasTexture(c);
  t.wrapS = t.wrapT = THREE.RepeatWrapping;
  t.repeat.set(18, 9);
  t.anisotropy = 4;
  return t;
}
