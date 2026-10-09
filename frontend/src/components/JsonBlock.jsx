import { useMemo } from "react";

// Bloque JSON bonito sobre tinta: colorea claves, strings, números y
// booleanos. Seguro por construcción: el JSON se escapa antes de colorear.
function pintar(obj) {
  const esc = (s) =>
    s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
  return esc(JSON.stringify(obj, null, 2)).replace(
    /("(?:[^"\\]|\\.)*")(:?)|(-?\d[\d.]*)|\b(true|false|null)\b/g,
    (m, str, colon, num, bool) => {
      if (str)
        return colon
          ? `<span class="text-sky">${str}:</span>`
          : `<span class="text-mint">${str}</span>`;
      if (num) return `<span class="text-apricot">${num}</span>`;
      return `<span class="text-blush">${bool}</span>`;
    },
  );
}

export default function JsonBlock({ data }) {
  const html = useMemo(() => pintar(data ?? {}), [data]);
  return (
    <pre
      className="overflow-x-auto border-[3px] border-ink bg-ink p-4 font-mono text-xs leading-relaxed text-bone sm:text-[13px]"
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
}
