import type { CSSProperties } from "react";
import { GRATICULE, LAND, MAP_H, MAP_W, NODES } from "../beyond/mapData";

/**
 * The same lightweight SVG map as the About section, with three project destinations. All animation is
 * driven by --bp on an ancestor (see globals.css). Each destination is a real link to its case study.
 */

type Stop = { slug: string; name: string; node: string; a: number };

const at = (id: string) => NODES.find((n) => n.id === id)!;

function arc(from: string, to: string, bend = 0.3) {
  const p = at(from);
  const q = at(to);
  const mx = (p.x + q.x) / 2;
  const my = (p.y + q.y) / 2;
  const lift = Math.hypot(q.x - p.x, q.y - p.y) * bend;
  return `M${p.x} ${p.y}Q${mx.toFixed(1)} ${(my - lift).toFixed(1)} ${q.x} ${q.y}`;
}

export default function ProjectMap({ stops }: { stops: Stop[] }) {
  // Signals leave the first destination and travel to the next one, so each hop reads as a hand-off.
  const hops = stops.slice(1).map((s, i) => ({ d: arc(stops[i].node, s.node, i === 0 ? 0.34 : 0.28), t: s.a - 0.07, k: i }));
  return (
    <svg className="bm" viewBox={`0 0 ${MAP_W} ${MAP_H}`} width={MAP_W} height={MAP_H} aria-label="World map linking three projects" role="group" focusable="false">
      <path className="bm-grat" d={GRATICULE} aria-hidden />
      <g aria-hidden>
        {LAND.map((d, i) => (
          <path key={i} className="bm-land" d={d} pathLength={1} style={{ "--d": ((i / LAND.length) * 0.05).toFixed(3) } as CSSProperties} />
        ))}
      </g>
      <g aria-hidden>
        {hops.map((h) => (
          <g key={h.k} style={{ "--t": h.t } as CSSProperties}>
            <path className="bm-arc" d={h.d} pathLength={1} />
            <path className="bm-pulse" d={h.d} pathLength={1} style={{ animationDelay: `${h.k * 1.6}s` }} />
          </g>
        ))}
      </g>
      <g>
        {stops.map((s, i) => {
          const n = at(s.node);
          return (
            <g key={s.slug} transform={`translate(${n.x} ${n.y})`}>
              <a href={`/work/${s.slug}`} className={`pm-stop pm-stop-${i + 1}`} aria-label={`Open the ${s.name} case study`} style={{ "--t": s.a - 0.03 } as CSSProperties}>
                <circle className="pm-hit" />
                <circle className="bm-halo" />
                <circle className="pm-ring" />
                <circle className="bm-dot" />
              </a>
            </g>
          );
        })}
      </g>
    </svg>
  );
}
