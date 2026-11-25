import type { CSSProperties } from "react";
import { GRATICULE, LAND, MAP_H, MAP_W, NODES } from "./mapData";

/**
 * Lightweight SVG world map. Every animation is driven by the CSS variable --bp (0 to 1) on an ancestor,
 * so this component has no state and no listeners. Thresholds (--t) say when each node and arc lights up.
 */

const node = (id: string) => NODES.find((n) => n.id === id)!;

/** When each node lights, in section progress. Identity first, then interests, then the journey. */
const NODE_T: Record<string, number> = { in: 0.12, sg: 0.38, dxb: 0.42, lon: 0.46, ny: 0.5, tok: 0.54, sf: 0.62, sp: 0.66, syd: 0.7, jhb: 0.74 };

const ARCS: [string, string, number][] = [
  ["in", "dxb", 0.4],
  ["in", "sg", 0.44],
  ["dxb", "lon", 0.48],
  ["lon", "ny", 0.52],
  ["in", "tok", 0.56],
  ["ny", "sf", 0.64],
  ["ny", "sp", 0.68],
  ["sg", "syd", 0.72],
  ["dxb", "jhb", 0.76],
];

function arc(a: string, b: string) {
  const p = node(a);
  const q = node(b);
  const mx = (p.x + q.x) / 2;
  const my = (p.y + q.y) / 2;
  const lift = Math.hypot(q.x - p.x, q.y - p.y) * 0.28;
  return `M${p.x} ${p.y}Q${mx.toFixed(1)} ${(my - lift).toFixed(1)} ${q.x} ${q.y}`;
}

export default function WorldMap() {
  return (
    <svg className="bm" viewBox={`0 0 ${MAP_W} ${MAP_H}`} width={MAP_W} height={MAP_H} aria-hidden focusable="false">
      <path className="bm-grat" d={GRATICULE} />
      <g>
        {LAND.map((d, i) => (
          <path key={i} className="bm-land" d={d} pathLength={1} style={{ "--d": ((i / LAND.length) * 0.07).toFixed(3) } as CSSProperties} />
        ))}
      </g>
      <g>
        {ARCS.map(([a, b, t]) => (
          <g key={a + b} style={{ "--t": t } as CSSProperties}>
            <path className="bm-arc" d={arc(a, b)} pathLength={1} />
            <path className="bm-pulse" d={arc(a, b)} pathLength={1} style={{ animationDelay: `${(t * 9).toFixed(1)}s` }} />
          </g>
        ))}
      </g>
      <g>
        {NODES.filter((n) => n.id in NODE_T).map((n) => (
          <g key={n.id} className={n.id === "in" ? "bm-node bm-home" : "bm-node"} transform={`translate(${n.x} ${n.y})`} style={{ "--t": NODE_T[n.id] } as CSSProperties}>
            <circle className="bm-halo" />
            <circle className="bm-dot" />
          </g>
        ))}
      </g>
    </svg>
  );
}
