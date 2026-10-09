// Medidor semicircular (portado del backup, con la paleta del tema).
export default function Gauge({ score, max }) {
  const pct = Math.max(0, Math.min(1, score / max));
  const cara = pct >= 0.75 ? "😄" : pct >= 0.5 ? "🙂" : pct >= 0.3 ? "😐" : "😟";
  return (
    <div className="text-center">
      <svg viewBox="0 0 200 112" className="mx-auto w-full max-w-[300px]">
        <path
          d="M 20 100 A 80 80 0 0 1 180 100"
          fill="none"
          stroke="#22344a"
          strokeOpacity="0.15"
          strokeWidth="16"
          strokeLinecap="round"
        />
        <path
          className="arc-fill"
          d="M 20 100 A 80 80 0 0 1 180 100"
          fill="none"
          stroke="#2b7fd4"
          strokeWidth="16"
          strokeLinecap="round"
          pathLength="100"
          strokeDasharray={`${pct * 100} 100`}
        />
        <g className="needle" style={{ transform: `rotate(${-90 + pct * 180}deg)` }}>
          <line x1="100" y1="100" x2="100" y2="34" stroke="#22344a" strokeWidth="4" strokeLinecap="round" />
          <circle cx="100" cy="100" r="7" fill="#22344a" />
        </g>
      </svg>
      <div className="font-display text-5xl tracking-wide">
        {Math.round(score)}
        <span className="text-xl text-ink/50"> / {max}</span>
      </div>
      <div className="mt-1 inline-flex h-11 w-11 items-center justify-center border-[3px] border-ink bg-bone text-xl">
        {cara}
      </div>
    </div>
  );
}
