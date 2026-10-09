import { useState } from "react";
import { motion } from "framer-motion";
import {
  ArrowDown,
  ArrowUpRight,
  BedDouble,
  Crosshair,
  Footprints,
  Frown,
  Sparkles,
  Target,
} from "lucide-react";
import { predict } from "../api.js";
import {
  SCORE,
  consejoPara,
  estadoDe,
  factorLimitante,
  fmtHoras,
  objetivoPara,
  toScore,
} from "../lib/wellness.js";
import Gauge from "../components/Gauge.jsx";
import Magnetic from "../components/Magnetic.jsx";
import Reveal from "../components/Reveal.jsx";
import { EASE_OUT } from "../lib/motion.js";
import Slider from "../components/Slider.jsx";
import { Link } from "react-router-dom";

const line = {
  hidden: { y: "112%" },
  visible: (i) => ({
    y: "0%",
    transition: { duration: 1.0, ease: EASE_OUT, delay: 0.5 + i * 0.1 },
  }),
};

const fade = {
  hidden: { opacity: 0, y: 26 },
  visible: (d) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.8, ease: EASE_OUT, delay: d },
  }),
};

// Inicio: todo vive en el hero bento (sin agenda, sin cinta, sin tira
// de proceso). UNA sola petición predict → score + lectura local.
export default function Home({ started }) {
  const [sueno, setSueno] = useState(6.5);
  const [minutos, setMinutos] = useState(45);
  const [estres, setEstres] = useState(8);
  const [raw, setRaw] = useState(null);
  const [error, setError] = useState("");
  const [cargando, setCargando] = useState(false);

  async function onSubmit(e) {
    e.preventDefault();
    setCargando(true);
    setError("");
    try {
      const data = await predict({ actividadHoras: minutos / 60, sueno, estres });
      setRaw(data.bienestar_estimado);
    } catch (err) {
      setError(err.message);
    } finally {
      setCargando(false);
    }
  }

  const score = raw === null ? null : toScore(raw);
  const estado = score === null ? null : estadoDe(score);
  const factor = factorLimitante({ sueno, actividadMin: minutos, estres });

  return (
    // El hero cubre la pantalla completa (header h-16 + resto): sin vacíos.
    <div className="grid min-h-[calc(100vh-4rem)] grid-cols-1 gap-[3px] bg-ink lg:grid-cols-12">
      {/* Celda izquierda: titular + botones */}
      <Reveal
        started={started}
        delay={0.1}
        direction="up"
        className="relative flex min-h-[480px] flex-col overflow-hidden bg-bone p-5 sm:p-8 lg:col-span-7 lg:min-h-0 lg:p-12"
      >
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 opacity-[0.07] [background-image:radial-gradient(#22344a_1px,transparent_1px)] [background-size:22px_22px]"
        />
        <motion.div
          variants={fade}
          custom={0.5}
          initial="hidden"
          animate={started ? "visible" : "hidden"}
          className="relative z-10 flex flex-wrap items-center gap-3"
        >
          <span className="flex items-center gap-2 border-[3px] border-ink bg-sky px-3 py-1.5 font-mono text-[9px] tracking-[0.18em] sm:text-[10px]">
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-ink opacity-60" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-ink" />
            </span>
            MODELO EN LÍNEA — REGRESIÓN POLINÓMICA
          </span>
        </motion.div>

        <div className="relative z-10 flex min-h-0 flex-1 flex-col justify-center py-8 lg:py-6">
          <h1 className="hero-title font-display uppercase leading-[0.92] tracking-[0.005em] text-[clamp(2.6rem,8.8vw,7.6rem)]">
            <span className="-mb-[0.08em] block overflow-hidden pb-[0.08em]">
              <motion.span variants={line} custom={0} initial="hidden" animate={started ? "visible" : "hidden"} className="block">
                Bienestar
              </motion.span>
            </span>
            <span className="-mb-[0.08em] block overflow-hidden pb-[0.08em]">
              <motion.span variants={line} custom={1} initial="hidden" animate={started ? "visible" : "hidden"} className="block">
                <span className="text-outline">que</span> se mide
              </motion.span>
            </span>
            <span className="-mb-[0.1em] block overflow-hidden pb-[0.16em]">
              <motion.span
                variants={line}
                custom={2}
                initial="hidden"
                animate={started ? "visible" : "hidden"}
                className="flex items-center gap-[0.16em]"
              >
                <span className="inline-block -rotate-2 border-[3px] border-ink bg-apricot px-[0.16em] font-serif text-[1.02em] italic leading-[1.02] transition-colors duration-300 hover:bg-coral hover:text-bone">
                  cada día
                </span>
              </motion.span>
            </span>
          </h1>

          <motion.div
            variants={fade}
            custom={1.0}
            initial="hidden"
            animate={started ? "visible" : "hidden"}
            className="mt-8 flex flex-wrap items-center gap-4 lg:mt-10"
          >
            <Magnetic>
              <a
                href="#habitos"
                className="group inline-flex items-center gap-4 border-[3px] border-ink bg-sky px-5 py-4 font-sans text-sm font-bold uppercase tracking-[0.08em] shadow-[6px_6px_0_var(--color-ink)] transition-all duration-300 hover:-translate-x-0.5 hover:-translate-y-0.5 hover:shadow-[9px_9px_0_var(--color-ink)] active:translate-x-0.5 active:translate-y-0.5 active:shadow-none sm:px-6"
              >
                Registrar hábitos
                <span className="flex h-7 w-7 items-center justify-center border-2 border-ink bg-ink text-bone transition-transform duration-500 group-hover:rotate-45">
                  <ArrowUpRight className="h-4 w-4" strokeWidth={2.6} />
                </span>
              </a>
            </Magnetic>
            <Link
              to="/lab"
              className="group inline-flex items-center gap-3 border-[3px] border-ink bg-transparent px-6 py-4 font-sans text-sm font-bold uppercase tracking-[0.08em] transition-colors duration-300 hover:bg-ink hover:text-bone"
            >
              Laboratorio
              <ArrowDown className="h-4 w-4 animate-bounce-soft" strokeWidth={2.6} />
            </Link>
          </motion.div>
        </div>
      </Reveal>

      {/* Columna derecha: hábitos arriba, consejos + score abajo */}
      <div className="grid grid-rows-[auto_auto] gap-[3px] bg-ink lg:col-span-5">
        <Reveal started={started} delay={0.25} direction="down" className="bg-bone p-5 sm:p-6">
          <div id="habitos" className="flex items-center justify-between">
            <span className="border-[3px] border-ink bg-sky px-2.5 py-1 font-mono text-[9px] tracking-[0.18em]">
              REGISTRA TUS HÁBITOS
            </span>
          </div>
          <form onSubmit={onSubmit} className="mt-4 flex flex-col gap-3">
            <Slider
              icon={<BedDouble className="h-5 w-5" strokeWidth={2.4} />}
              tint="#8ec5ff"
              label="Horas de sueño"
              num={sueno}
              display={fmtHoras(sueno)}
              min={0}
              max={12}
              step={0.5}
              onChange={setSueno}
            />
            <Slider
              icon={<Footprints className="h-5 w-5" strokeWidth={2.4} />}
              tint="#3ecf8e"
              label="Minutos de actividad"
              num={minutos}
              display={`${minutos} min`}
              min={0}
              max={180}
              step={5}
              onChange={setMinutos}
            />
            <Slider
              icon={<Frown className="h-5 w-5" strokeWidth={2.4} />}
              tint="#ff6b4a"
              label="Nivel de estrés"
              num={estres}
              display={`${estres}/10`}
              min={0}
              max={10}
              step={1}
              onChange={setEstres}
            />
            <button
              type="submit"
              disabled={cargando}
              className="inline-flex items-center justify-center gap-3 border-[3px] border-ink bg-ink px-6 py-4 font-sans text-sm font-bold uppercase tracking-[0.08em] text-bone shadow-[6px_6px_0_var(--color-ink)] transition-all duration-300 hover:-translate-x-0.5 hover:-translate-y-0.5 hover:bg-skydark hover:shadow-[9px_9px_0_var(--color-ink)] active:translate-x-0.5 active:translate-y-0.5 active:shadow-none disabled:cursor-wait disabled:opacity-70"
            >
              <Sparkles className="h-4 w-4" strokeWidth={2.6} />
              {cargando ? "Calculando…" : "Predecir"}
            </button>
          </form>
          {error && (
            <p className="mt-3 border-[3px] border-ink bg-coral px-3 py-2 font-mono text-[10px] tracking-[0.16em] text-bone">
              {error.toUpperCase()}
            </p>
          )}
        </Reveal>

        <div className="grid grid-cols-1 gap-[3px] bg-ink sm:grid-cols-2 lg:grid-cols-1 xl:grid-cols-2">
          <Reveal
            started={started}
            delay={0.45}
            direction="left"
            className="bg-mint p-5"
          >
            <span className="border-[3px] border-ink bg-bone px-2.5 py-1 font-mono text-[9px] tracking-[0.18em]">
              CONSEJOS
            </span>
            {/* Los consejos existen desde el inicio; vacíos hasta calcular. */}
            <div className="mt-3 flex flex-col gap-2">
              <div className="border-[3px] border-ink bg-bone p-3">
                <p className="flex items-center gap-1.5 font-mono text-[9px] tracking-[0.16em] text-ink/55">
                  <Crosshair className="h-3.5 w-3.5" strokeWidth={2.4} /> TU PUNTO DÉBIL
                </p>
                <p className="mt-1 font-display text-base uppercase leading-tight tracking-wide">
                  {raw === null ? "—" : factor.texto}
                </p>
              </div>
              <div className="border-[3px] border-ink bg-bone p-3">
                <p className="flex items-center gap-1.5 font-mono text-[9px] tracking-[0.16em] text-ink/55">
                  <Sparkles className="h-3.5 w-3.5" strokeWidth={2.4} /> CONSEJO
                </p>
                <p className="mt-1 font-display text-base uppercase leading-tight tracking-wide">
                  {raw === null ? "—" : consejoPara(factor.tipo, score)}
                </p>
              </div>
              <div className="border-[3px] border-ink bg-ink p-3 text-bone">
                <p className="flex items-center gap-1.5 font-mono text-[9px] tracking-[0.16em] text-bone/60">
                  <Target className="h-3.5 w-3.5" strokeWidth={2.4} /> META DE HOY
                </p>
                <p className="mt-1 font-display text-base uppercase leading-tight tracking-wide">
                  {raw === null ? "—" : objetivoPara(factor.tipo, { actividadMin: minutos }, score)}
                </p>
              </div>
            </div>
          </Reveal>

          <Reveal started={started} delay={0.55} direction="left" className="bg-bone p-5">
            <span className="border-[3px] border-ink bg-apricot px-2.5 py-1 font-mono text-[9px] tracking-[0.18em]">
              SCORE
            </span>
            {/* El medidor arranca en 0; el estado llega al calcular. */}
            <div className="pt-2">
              <Gauge score={score ?? 0} max={SCORE.max} />
              <p className="mt-2 text-center font-mono text-[10px] tracking-[0.2em]">
                ESTADO: {raw === null ? "SIN CALCULAR" : estado.nombre.toUpperCase()}
              </p>
            </div>
          </Reveal>
        </div>
      </div>
    </div>
  );
}
