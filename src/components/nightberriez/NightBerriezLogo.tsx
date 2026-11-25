import { NB_B, NB_N, NB_WORDMARK } from "./logoPaths";

/**
 * The NightBerrieZ logo, drawn entirely in SVG (no image file). The monogram, wordmark and tagline are separate
 * groups (`.nb-mark`, `.nb-word`, `.nb-tag`) so the section can reveal them in stages.
 */
export function NightBerriezLogo({ className, title = "NightBerrieZ, innovation that shines the nights" }: { className?: string; title?: string }) {
  return (
    <svg className={className} viewBox="70 290 860 450" role="img" aria-label={title} xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="nb-face" x1="0" y1="0" x2="0.35" y2="1">
          <stop offset="0" stopColor="#c0222f" />
          <stop offset="0.55" stopColor="#9c1523" />
          <stop offset="1" stopColor="#6f0912" />
        </linearGradient>
        <linearGradient id="nb-word-face" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#b8212e" />
          <stop offset="1" stopColor="#860d19" />
        </linearGradient>
        <clipPath id="nb-clip">
          <path d={NB_N} />
          <path d={NB_B} />
        </clipPath>
        <linearGradient id="nb-sheen-g" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0" stopColor="#fff" stopOpacity="0" />
          <stop offset="0.5" stopColor="#ff9aa2" stopOpacity="0.38" />
          <stop offset="1" stopColor="#fff" stopOpacity="0" />
        </linearGradient>
        <linearGradient id="nb-rule-l" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0" stopColor="#fff" stopOpacity="0" />
          <stop offset="1" stopColor="#fff" stopOpacity="0.9" />
        </linearGradient>
        <linearGradient id="nb-rule-r" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0" stopColor="#fff" stopOpacity="0.9" />
          <stop offset="1" stopColor="#fff" stopOpacity="0" />
        </linearGradient>
      </defs>

      <g className="nb-mark">
        <path d={NB_N} fill="url(#nb-face)" />
        <path d={NB_B} fill="url(#nb-face)" />
        <g clipPath="url(#nb-clip)">
          <rect className="nb-sheen" x="300" y="300" width="130" height="300" fill="url(#nb-sheen-g)" transform="skewX(-18)" />
        </g>
      </g>

      <path className="nb-word" d={NB_WORDMARK} fill="url(#nb-word-face)" fillRule="evenodd" />

      <g className="nb-tag">
        <rect x="97" y="711" width="106" height="1.4" fill="url(#nb-rule-l)" />
        <rect x="797" y="711" width="108" height="1.4" fill="url(#nb-rule-r)" />
        <text x="228" y="718" textLength="546" lengthAdjust="spacing" fill="#e6e1d8" fontSize="17" fontWeight="300" fontFamily="var(--font-sans), system-ui, sans-serif">
          INNOVATION THAT SHINES THE NIGHTS
        </text>
      </g>
    </svg>
  );
}
