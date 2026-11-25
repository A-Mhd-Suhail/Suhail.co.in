/**
 * Adaptive quality. Combines what the browser reports (memory, cores, data saver, connection) with the GPU's
 * own name, so a software or very old GPU is treated as low even on a fast-looking phone. The result picks
 * texture sizes, particle counts and pixel density; it never switches an experience off.
 */
export type Tier = "high" | "mid" | "low";

interface NavigatorExtras {
  deviceMemory?: number;
  connection?: { saveData?: boolean; effectiveType?: string };
}

let cached: Tier | null = null;

function gpuName(): string {
  try {
    const c = document.createElement("canvas");
    const gl = (c.getContext("webgl") || c.getContext("experimental-webgl")) as WebGLRenderingContext | null;
    if (!gl) return "";
    const ext = gl.getExtension("WEBGL_debug_renderer_info");
    const name = ext ? String(gl.getParameter(ext.UNMASKED_RENDERER_WEBGL)) : "";
    gl.getExtension("WEBGL_lose_context")?.loseContext();
    return name;
  } catch {
    return "";
  }
}

export function getTier(): Tier {
  if (cached) return cached;
  if (typeof navigator === "undefined") return "mid";
  const nav = navigator as Navigator & NavigatorExtras;
  let score = 0;

  const mem = nav.deviceMemory ?? 4;
  score += mem >= 8 ? 2 : mem >= 4 ? 1 : -1;
  const cores = navigator.hardwareConcurrency ?? 4;
  score += cores >= 8 ? 2 : cores >= 4 ? 1 : -1;
  if (Math.min(window.innerWidth, window.innerHeight) < 500) score -= 1;
  const conn = nav.connection;
  if (conn?.saveData || /(^|-)2g|3g/.test(conn?.effectiveType ?? "")) score -= 1;

  const gpu = gpuName();
  if (/swiftshader|llvmpipe|software|microsoft basic/i.test(gpu)) score -= 4;
  else if (/mali-4|mali-t[0-7]|adreno \(tm\) [2-4]\d\d|powervr|videocore|vivante/i.test(gpu)) score -= 3;
  else if (/apple|nvidia|radeon|geforce|adreno \(tm\) [6-9]\d\d|mali-g[7-9]/i.test(gpu)) score += 1;

  cached = score >= 3 ? "high" : score >= 1 ? "mid" : "low";
  return cached;
}
