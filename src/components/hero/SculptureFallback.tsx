/** Static drawing of the lens android, for browsers without WebGL or if the 3D scene does not start. */
export function SculptureFallback() {
  return (
    <svg className="sculpture-fallback" viewBox="0 0 600 600" preserveAspectRatio="xMidYMid meet" aria-hidden focusable="false">
      <defs>
        <radialGradient id="sf-head" cx="0.4" cy="0.35" r="0.75">
          <stop offset="0" stopColor="#f7f5f0" />
          <stop offset="0.6" stopColor="#EEEAE3" />
          <stop offset="1" stopColor="#7c7a74" />
        </radialGradient>
        <linearGradient id="sf-chrome" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#5c5f66" />
          <stop offset="0.5" stopColor="#D7DADF" />
          <stop offset="1" stopColor="#4a4d54" />
        </linearGradient>
      </defs>
      <path d="M300 60 C 400 60 440 180 440 300 C 440 420 380 520 300 520 C 220 520 160 420 160 300 C 160 180 200 60 300 60 Z" fill="url(#sf-head)" />
      <rect x="265" y="520" width="70" height="60" fill="#1b1b1e" />
      {[-1, 1].map((s) => (
        <g key={s} transform={`translate(${300 + s * 72} 290)`}>
          <circle r="46" fill="none" stroke="url(#sf-chrome)" strokeWidth="6" />
          <circle r="40" fill="#0a0a0b" />
          <circle r="20" fill="none" stroke="#B49A7B" strokeWidth="2" opacity="0.9" />
        </g>
      ))}
    </svg>
  );
}
