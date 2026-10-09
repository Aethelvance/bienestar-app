import { useEffect, useId, useRef, useState } from "react";
import mermaid from "mermaid";

let iniciado = false;

// Renderiza un diagrama Mermaid con la paleta del proyecto.
// El SVG se genera en cliente; si la sintaxis falla se muestra el error.
export default function Mermaid({ code, title }) {
  const id = `mmd${useId().replace(/[^a-zA-Z0-9]/g, "")}`;
  const ref = useRef(null);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!iniciado) {
      mermaid.initialize({
        startOnLoad: false,
        theme: "base",
        themeVariables: {
          background: "#FFFDF8",
          primaryColor: "#E3DDFF",
          primaryTextColor: "#22344A",
          primaryBorderColor: "#22344A",
          lineColor: "#22344A",
          secondaryColor: "#DCEFFF",
          tertiaryColor: "#FFF6E9",
          fontFamily: '"Space Mono", monospace',
          fontSize: "13px",
        },
        flowchart: { curve: "linear", htmlLabels: true },
      });
      iniciado = true;
    }
    setError("");
    mermaid
      .render(id, code)
      .then(({ svg }) => {
        if (ref.current) ref.current.innerHTML = svg;
      })
      .catch((e) => setError(String(e?.message ?? e)));
  }, [code, id]);

  if (error)
    return (
      <p className="border-[3px] border-ink bg-coral px-3 py-2 font-mono text-[10px] text-bone">
        DIAGRAMA INVÁLIDO: {error.toUpperCase().slice(0, 160)}
      </p>
    );
  return <div ref={ref} role="img" aria-label={title} className="mermaid" />;
}
