// Fila de hábito: icono + etiqueta + slider (un solo sitio para los 3).
export default function Slider({ icon, tint, label, num, display, min, max, step, onChange }) {
  return (
    <div className="group flex items-center gap-3 border-[3px] border-ink bg-bone p-3 transition-colors duration-300 hover:bg-sky/40 sm:p-4">
      <span
        className="flex h-11 w-11 shrink-0 items-center justify-center border-[3px] border-ink transition-transform duration-500 group-hover:-rotate-12"
        style={{ background: tint }}
      >
        {icon}
      </span>
      <div className="min-w-0 flex-1">
        <div className="flex items-baseline justify-between gap-2">
          <span className="font-mono text-[10px] tracking-[0.16em] text-ink/60 sm:text-[11px]">
            {label.toUpperCase()}
          </span>
          <b className="font-display text-lg tracking-wide sm:text-xl">{display}</b>
        </div>
        <input
          type="range"
          min={min}
          max={max}
          step={step}
          value={num}
          onChange={(e) => onChange(+e.target.value)}
          aria-label={label}
          className="mt-1 w-full"
        />
      </div>
    </div>
  );
}
