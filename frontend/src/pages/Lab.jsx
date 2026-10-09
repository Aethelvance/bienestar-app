import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  BedDouble,
  Braces,
  Check,
  FlaskConical,
  Footprints,
  Frown,
  HeartPulse,
  Info,
  Network,
  Send,
  Server,
  Sparkles,
} from "lucide-react";
import { Link } from "react-router-dom";
import { getHealth, getInfo, predict } from "../api.js";
import { SCORE, estadoDe, fmtHoras, toScore } from "../lib/wellness.js";
import Gauge from "../components/Gauge.jsx";
import Magnetic from "../components/Magnetic.jsx";
import Mermaid from "../components/Mermaid.jsx";
import { EASE_OUT } from "../lib/motion.js";
import {
  diagApi,
  diagDeploy,
  diagEntreno,
  diagPipeline,
  diagPredict,
  diagProblema,
} from "../lib/diagrams.js";
import JsonBlock from "../components/JsonBlock.jsx";
import Slider from "../components/Slider.jsx";

// Laboratorio API (antes "Ajustes"): un selector por endpoint.
// Cada ensayo muestra el JSON crudo Y cómo la app lo renderiza.
const TABS = [
  { id: "health", nombre: "Health", ico: <HeartPulse className="h-4 w-4" strokeWidth={2.6} /> },
  { id: "predict", nombre: "Predict", ico: <Sparkles className="h-4 w-4" strokeWidth={2.6} /> },
  { id: "info", nombre: "Info", ico: <Info className="h-4 w-4" strokeWidth={2.6} /> },
  { id: "diagrams", nombre: "Diagrams", ico: <Network className="h-4 w-4" strokeWidth={2.6} /> },
];

export default function Lab({ started }) {
  const [tab, setTab] = useState("health");

  return (
    <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
      <motion.div
        initial={{ opacity: 0, y: 26 }}
        animate={started ? { opacity: 1, y: 0 } : {}}
        transition={{ duration: 0.8, ease: EASE_OUT, delay: 0.3 }}
      >
        <span className="inline-flex items-center gap-2 border-[3px] border-ink bg-lilac px-3 py-1.5 font-mono text-[9px] tracking-[0.2em] sm:text-[10px]">
          <FlaskConical className="h-3.5 w-3.5" strokeWidth={2.6} />
          LABORATORIO API
        </span>
        <h1 className="mt-4 font-display uppercase leading-[0.92] text-[clamp(2.4rem,6.4vw,5rem)]">
          Prueba <span className="font-serif normal-case italic">cada</span> endpoint
        </h1>
        <div className="mt-6 flex flex-wrap gap-3" role="tablist">
          {TABS.map((t) => (
            <button
              key={t.id}
              role="tab"
              aria-selected={tab === t.id}
              onClick={() => setTab(t.id)}
              className={`inline-flex items-center gap-2 border-[3px] border-ink px-5 py-3 font-sans text-sm font-bold uppercase tracking-[0.08em] transition-all duration-300 ${
                tab === t.id
                  ? "bg-ink text-bone shadow-[6px_6px_0_var(--color-ink)]"
                  : "bg-bone shadow-[4px_4px_0_var(--color-ink)] hover:-translate-x-0.5 hover:-translate-y-0.5 hover:bg-sky hover:shadow-[7px_7px_0_var(--color-ink)] active:translate-x-0.5 active:translate-y-0.5 active:shadow-none"
              }`}
            >
              {t.ico} {t.nombre}
            </button>
          ))}
        </div>
      </motion.div>

      <AnimatePresence mode="wait" initial={false}>
        <motion.div
          key={tab}
          initial={{ opacity: 0, x: 60 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -60 }}
          transition={{ duration: 0.4, ease: EASE_OUT }}
          className="mt-8"
        >
          {tab === "health" && <EnsayoHealth />}
          {tab === "predict" && <EnsayoPredict />}
          {tab === "info" && <EnsayoInfo />}
          {tab === "diagrams" && <EnsayoDiagrams />}
        </motion.div>
      </AnimatePresence>

      <p className="mt-8 font-mono text-[10px] tracking-[0.18em] text-ink/50">
        <Link to="/" className="underline underline-offset-4 transition-colors hover:text-ink">
          ← VOLVER AL INICIO
        </Link>
      </p>
    </div>
  );
}

/* ---------- GET /health ---------- */
function EnsayoHealth() {
  const [res, setRes] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    getHealth()
      .then(setRes)
      .catch((e) => setError(e.message));
  }, []);

  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
      <section className="border-[3px] border-ink bg-bone p-5 shadow-[6px_6px_0_var(--color-ink)]">
        <p className="mb-3 font-mono text-[10px] tracking-[0.18em]">
          <span className="border-2 border-ink bg-mint px-2 py-0.5 font-bold">GET</span>{" "}
          /api/health → JSON
        </p>
        {res && <JsonBlock data={res} />}
        {error && <p className="border-[3px] border-ink bg-coral px-3 py-2 font-mono text-[10px] text-bone">{error.toUpperCase()}</p>}
      </section>
      <section className="border-[3px] border-ink bg-mint p-5 shadow-[6px_6px_0_var(--color-ink)] sm:p-6">
        <span className="inline-flex items-center gap-2 font-mono text-[10px] tracking-[0.2em] text-ink/60">
          <Server className="h-4 w-4" strokeWidth={2.4} /> ASÍ LO USAMOS
        </span>
        {res ? (
          <>
            <p className="mt-3 font-display text-6xl uppercase">● OK</p>
            <div className="mt-3 flex flex-wrap gap-2">
              <span className="border-[3px] border-ink bg-bone px-3 py-1 font-mono text-[10px] tracking-[0.16em]">
                {res.service.toUpperCase()}
              </span>
              <span className="inline-flex items-center gap-1.5 border-[3px] border-ink bg-ink px-3 py-1 font-mono text-[10px] tracking-[0.16em] text-bone">
                <Check className="h-3.5 w-3.5" strokeWidth={3} /> 200
              </span>
            </div>
          </>
        ) : (
          <p className="mt-3 font-mono text-[11px] tracking-[0.1em]">PROBANDO CONEXIÓN…</p>
        )}
      </section>
    </div>
  );
}

/* ---------- POST /predict ---------- */
function EnsayoPredict() {
  const [sueno, setSueno] = useState(6.5);
  const [minutos, setMinutos] = useState(45);
  const [estres, setEstres] = useState(8);
  const [res, setRes] = useState(null);
  const [error, setError] = useState("");
  const [cargando, setCargando] = useState(false);

  // El JSON exacto que viaja al backend (la app envía horas, no minutos).
  const enviado = { actividad: minutos / 60, sueno, estres };

  async function onSubmit(e) {
    e.preventDefault();
    setCargando(true);
    setError("");
    try {
      setRes(await predict({ actividadHoras: minutos / 60, sueno, estres }));
    } catch (err) {
      setError(err.message);
    } finally {
      setCargando(false);
    }
  }

  const score = res ? toScore(res.bienestar_estimado) : null;

  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
      <section className="border-[3px] border-ink bg-bone p-5 shadow-[6px_6px_0_var(--color-ink)]">
        <span className="font-mono text-[10px] tracking-[0.2em] text-ink/60">1 · ELIGE LOS DATOS</span>
        <form onSubmit={onSubmit} className="mt-4 flex flex-col gap-3">
          <Slider icon={<BedDouble className="h-5 w-5" strokeWidth={2.4} />} tint="#8ec5ff" label="Horas de sueño" num={sueno} display={fmtHoras(sueno)} min={0} max={12} step={0.5} onChange={setSueno} />
          <Slider icon={<Footprints className="h-5 w-5" strokeWidth={2.4} />} tint="#3ecf8e" label="Minutos de actividad" num={minutos} display={`${minutos} min`} min={0} max={180} step={5} onChange={setMinutos} />
          <Slider icon={<Frown className="h-5 w-5" strokeWidth={2.4} />} tint="#ff6b4a" label="Nivel de estrés" num={estres} display={`${estres}/10`} min={0} max={10} step={1} onChange={setEstres} />
          <button
            type="submit"
            disabled={cargando}
            className="inline-flex items-center justify-center gap-3 border-[3px] border-ink bg-sky px-6 py-4 font-sans text-sm font-bold uppercase tracking-[0.08em] shadow-[6px_6px_0_var(--color-ink)] transition-all duration-300 hover:-translate-x-0.5 hover:-translate-y-0.5 hover:shadow-[9px_9px_0_var(--color-ink)] active:translate-x-0.5 active:translate-y-0.5 active:shadow-none disabled:cursor-wait disabled:opacity-70"
          >
            <Send className="h-4 w-4" strokeWidth={2.6} />
            {cargando ? "Enviando…" : "Enviar predict"}
          </button>
        </form>
        {error && <p className="mt-3 border-[3px] border-ink bg-coral px-3 py-2 font-mono text-[10px] text-bone">{error.toUpperCase()}</p>}
      </section>

      <section className="border-[3px] border-ink bg-apricot p-5 shadow-[6px_6px_0_var(--color-ink)]">
        <span className="font-mono text-[10px] tracking-[0.2em] text-ink/60">2 · JSON QUE ENVIAMOS</span>
        <p className="mb-3 mt-2 font-mono text-[10px] tracking-[0.18em]">
          <span className="border-2 border-ink bg-bone px-2 py-0.5 font-bold">POST</span> /api/predict
        </p>
        <JsonBlock data={enviado} />
      </section>

      <section className="border-[3px] border-ink bg-bone p-5 shadow-[6px_6px_0_var(--color-ink)]">
        <span className="font-mono text-[10px] tracking-[0.2em] text-ink/60">3 · JSON QUE RECIBIMOS</span>
        <div className="mt-3">
          {res ? <JsonBlock data={res} /> : <p className="font-mono text-[11px] text-ink/55">ENVÍA EL FORMULARIO PARA VER LA RESPUESTA.</p>}
        </div>
      </section>

      <section className="border-[3px] border-ink bg-blush p-5 shadow-[6px_6px_0_var(--color-ink)]">
        <span className="inline-flex items-center gap-2 font-mono text-[10px] tracking-[0.2em] text-ink/60">
          <Braces className="h-4 w-4" strokeWidth={2.4} /> 4 · ASÍ LO USAMOS
        </span>
        {res ? (
          <div className="mt-2">
            <Gauge score={score} max={SCORE.max} />
            <p className="mt-2 text-center font-mono text-[11px] tracking-[0.1em]">
              CRUDO <b>{res.bienestar_estimado}</b> → SCORE <b>{Math.round(score)}</b> ·{" "}
              {estadoDe(score).nombre.toUpperCase()}
            </p>
          </div>
        ) : (
          <p className="mt-3 font-mono text-[11px] text-ink/55">EL MEDIDOR SE DIBUJA CON ESTE JSON.</p>
        )}
      </section>
    </div>
  );
}

/* ---------- DIAGRAMS: rigor técnico con nuestro contexto ---------- */
const SUBTABS = [
  { id: "problema", nombre: "Problema", make: () => diagProblema() },
  { id: "pipeline", nombre: "Pipeline", make: (info) => diagPipeline(info), live: true },
  { id: "entreno", nombre: "Entreno", make: () => diagEntreno() },
  { id: "api", nombre: "API", make: () => diagApi() },
  { id: "predict", nombre: "Predict", make: () => diagPredict() },
  { id: "deploy", nombre: "Deploy", make: () => diagDeploy() },
];

function EnsayoDiagrams() {
  const [sub, setSub] = useState("problema");
  const [info, setInfo] = useState(null);

  useEffect(() => {
    getInfo()
      .then(setInfo)
      .catch(() => {});
  }, []);

  const tab = SUBTABS.find((t) => t.id === sub);

  return (
    <div>
      <div className="flex flex-wrap gap-2" role="tablist" aria-label="Sub-diagramas">
        {SUBTABS.map((t) => (
          <button
            key={t.id}
            role="tab"
            aria-selected={sub === t.id}
            onClick={() => setSub(t.id)}
            className={`border-[3px] border-ink px-4 py-2 font-mono text-[10px] tracking-[0.18em] transition-all duration-300 ${
              sub === t.id
                ? "bg-sky shadow-[4px_4px_0_var(--color-ink)]"
                : "bg-bone hover:-translate-x-0.5 hover:-translate-y-0.5 hover:bg-sky/50"
            }`}
          >
            {t.nombre.toUpperCase()}
          </button>
        ))}
      </div>

      <div className="mt-6 border-[3px] border-ink bg-bone p-4 shadow-[6px_6px_0_var(--color-ink)] sm:p-6">
        {tab.live && !info ? (
          <p className="font-mono text-[11px]">CARGANDO DATOS DE /INFO…</p>
        ) : (
          <>
            <Mermaid code={tab.make(info)} title={`Diagrama ${tab.nombre}`} />
            {tab.live && (
              <p className="mt-3 font-mono text-[10px] tracking-[0.16em] text-ink/55">
                CONTEOS EN VIVO DE /INFO — NOMBRES VERIFICADOS DEL PIPELINE.
              </p>
            )}
          </>
        )}
      </div>
    </div>
  );
}

/* ---------- GET /info ---------- */
function EnsayoInfo() {
  const [res, setRes] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    getInfo()
      .then(setRes)
      .catch((e) => setError(e.message));
  }, []);

  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
      <section className="border-[3px] border-ink bg-bone p-5 shadow-[6px_6px_0_var(--color-ink)]">
        <p className="mb-3 font-mono text-[10px] tracking-[0.18em]">
          <span className="border-2 border-ink bg-mint px-2 py-0.5 font-bold">GET</span>{" "}
          /api/info → JSON
        </p>
        {res && <JsonBlock data={res} />}
        {error && <p className="border-[3px] border-ink bg-coral px-3 py-2 font-mono text-[10px] text-bone">{error.toUpperCase()}</p>}
      </section>
      <section className="border-[3px] border-ink bg-sky p-5 shadow-[6px_6px_0_var(--color-ink)] sm:p-6">
        <span className="inline-flex items-center gap-2 font-mono text-[10px] tracking-[0.2em] text-ink/60">
          <Braces className="h-4 w-4" strokeWidth={2.4} /> ASÍ LO USAMOS
        </span>
        {res ? (
          <>
            <p className="mt-2 font-display text-5xl uppercase leading-none">{res.model.family}</p>
            <div className="mt-4 flex flex-wrap gap-2">
              <Magnetic>
                <span className="inline-block border-[3px] border-ink bg-bone px-3 py-1 font-mono text-[10px] tracking-[0.16em]">
                  {res.model.estimator.toUpperCase()}
                </span>
              </Magnetic>
              <span className="border-[3px] border-ink bg-bone px-3 py-1 font-mono text-[10px] tracking-[0.16em]">
                {res.model.n_coefficients} COEFICIENTES
              </span>
              {res.model.pipeline_steps.map((p) => (
                <span key={p} className="border-[3px] border-ink bg-ink px-3 py-1 font-mono text-[10px] tracking-[0.16em] text-bone">
                  {p.toUpperCase()}
                </span>
              ))}
            </div>
            <p className="mt-4 font-mono text-[11px] tracking-[0.1em]">
              {res.model.input_variables.join(" + ").toUpperCase()} →{" "}
              {res.model.target.toUpperCase()}
            </p>
          </>
        ) : (
          <p className="mt-3 font-mono text-[11px]">CARGANDO FICHA…</p>
        )}
      </section>
    </div>
  );
}
