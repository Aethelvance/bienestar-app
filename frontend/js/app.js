// =====================================================
// CONFIGURACIÓN
// =====================================================
const CFG = {
  rawMin: -250,   // valor del modelo que se muestra como 0
  rawMax: 350,    // valor del modelo que se muestra como 300
  scoreMax: 300,
  metaSueno: 8,        // horas ideales (para el anillo de calidad de sueño)
  metaActividad: 60,   // minutos ideales de actividad
};

const API_URL_STORAGE_KEY = "bienestarApiUrl";
const $ = (id) => document.getElementById(id);
const clamp = (v, a, b) => Math.min(b, Math.max(a, v));
const state = { sueno: 6.5, actividad: 45, estres: 8, raw: null, recs: [] };

// ---- conversión del valor crudo del modelo a score 0-300 ----
const toScore = (raw) => clamp(((raw - CFG.rawMin) / (CFG.rawMax - CFG.rawMin)) * CFG.scoreMax, 0, CFG.scoreMax);

// =====================================================
// API
// =====================================================
const apiUrl = () => $("apiUrl").value.trim().replace(/\/+$/, "");

// El modelo espera actividad en HORAS; la app trabaja en minutos.
async function predecirRaw(sueno, actividadMin, estres) {
  const resp = await fetch(`${apiUrl()}/predict`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ actividad: actividadMin / 60, sueno, estres }),
  });
  const data = await resp.json().catch(() => ({}));
  if (!resp.ok) throw new Error(data.error || `Error HTTP ${resp.status}`);
  return data.bienestar_estimado;
}

// =====================================================
// MEDIDOR (SVG)
// =====================================================
function gaugeHTML(p) {
  return `
  <svg viewBox="0 0 200 112">
    <defs>
      <linearGradient id="g-${p}" x1="0" x2="1">
        <stop offset="0" stop-color="#2d7fd6"/><stop offset=".55" stop-color="#35b4c9"/><stop offset="1" stop-color="#3cc27e"/>
      </linearGradient>
    </defs>
    <path d="M 20 100 A 80 80 0 0 1 180 100" fill="none" stroke="#c9e0f1" stroke-width="16" stroke-linecap="round"/>
    <path id="arc-${p}" class="arc-fill" d="M 20 100 A 80 80 0 0 1 180 100" fill="none" stroke="url(#g-${p})"
          stroke-width="16" stroke-linecap="round" pathLength="100" stroke-dasharray="0 100"/>
    <g id="needle-${p}" class="needle" style="transform:rotate(-90deg)">
      <line x1="100" y1="100" x2="100" y2="34" stroke="#1d3248" stroke-width="4" stroke-linecap="round"/>
      <circle cx="100" cy="100" r="7" fill="#1d3248"/>
    </g>
  </svg>
  <div class="gauge-face" id="face-${p}">🙂</div>
  <div class="gauge-score"><b id="score-${p}">–</b><span> / ${CFG.scoreMax}</span><small>TU SCORE DE BIENESTAR HOY</small></div>`;
}

function setGauge(p, score) {
  const pct = score / CFG.scoreMax;
  $(`arc-${p}`).setAttribute("stroke-dasharray", `${pct * 100} 100`);
  $(`needle-${p}`).style.transform = `rotate(${-90 + pct * 180}deg)`;
  $(`score-${p}`).textContent = Math.round(score);
  $(`face-${p}`).textContent = pct >= 0.75 ? "😄" : pct >= 0.5 ? "🙂" : pct >= 0.3 ? "😐" : "😟";
}

// ---- anillos de progreso ----
function ringHTML(color, id) {
  const c = 2 * Math.PI * 28;
  return `<svg viewBox="0 0 70 70"><circle class="bg" cx="35" cy="35" r="28"/>
    <circle class="fg" id="${id}-c" cx="35" cy="35" r="28" stroke="${color}" stroke-dasharray="0 ${c}"/></svg>
    <span id="${id}-t">–</span>`;
}
function setRing(id, pct) {
  const c = 2 * Math.PI * 28;
  $(`${id}-c`).setAttribute("stroke-dasharray", `${(pct / 100) * c} ${c}`);
  $(`${id}-t`).textContent = Math.round(pct) + "%";
}
function actualizarAnillos() {
  setRing("ring-sueno", clamp(100 - Math.abs(state.sueno - CFG.metaSueno) * 15, 0, 100));
  setRing("ring-act", clamp((state.actividad / CFG.metaActividad) * 100, 0, 100));
  setRing("ring-mental", clamp((10 - state.estres) * 10, 0, 100));
}

// =====================================================
// MOTOR DE RECOMENDACIONES
// Prueba escenarios con el modelo y se queda con los que más suman.
// =====================================================
const fmtH = (h) => (Number.isInteger(h) ? `${h}` : h.toFixed(1)) + " h";

async function calcularRecomendaciones(baseRaw) {
  const { sueno: s, actividad: a, estres: e } = state;
  const candidatos = [];

  // Solo se propone dormir MÁS (hasta 9 h): el modelo es cuadrático y a veces "premia" dormir menos.
  [0.5, 1, 1.5].forEach((d) => {
    const v = clamp(s + d, 0, 9);
    if (v > s) candidatos.push({ tipo: "sueno", args: [v, a, e], valor: v });
  });
  [15, 30, 45].forEach((d) => {
    const v = clamp(a + d, 0, 180);
    if (v !== a) candidatos.push({ tipo: "actividad", args: [s, v, e], valor: v, extra: v - a });
  });
  [1, 2, 3].forEach((d) => {
    const v = clamp(e - d, 0, 10);
    if (v !== e) candidatos.push({ tipo: "estres", args: [s, a, v], valor: v, extra: e - v });
  });

  const raws = await Promise.all(candidatos.map((c) => predecirRaw(...c.args)));
  candidatos.forEach((c, i) => (c.impacto = (raws[i] - baseRaw) / (CFG.rawMax - CFG.rawMin)));

  // mejor candidato por categoría, conservando el umbral en la escala original
  const mejores = ["sueno", "actividad", "estres"]
    .map((t) => candidatos.filter((c) => c.tipo === t).sort((x, y) => y.impacto - x.impacto)[0])
    .filter((c) => c && c.impacto >= 1 / CFG.scoreMax)
    .sort((x, y) => y.impacto - x.impacto);
  return mejores;
}

function textoRec(r) {
  if (r.tipo === "sueno") return r.valor > state.sueno
    ? { ico: "🌙", txt: `Intenta dormir ${fmtH(r.valor)} esta noche; es ${fmtH(r.valor - state.sueno)} más que hoy.` }
    : { ico: "🌙", txt: `Ajusta tu sueño a ${fmtH(r.valor)}` };
  if (r.tipo === "actividad") return { ico: "🚶", txt: `Camina ${r.extra} min más para llegar a ${r.valor} min de actividad.` };
  return { ico: "🧘", txt: `Prueba una pausa de respiración para acercarte a ${r.valor}/10 de estrés.` };
}

function obtenerFactorLimitante() {
  const factores = [
    {
      tipo: "sueno",
      cumplimiento: clamp(100 - Math.abs(state.sueno - CFG.metaSueno) * 15, 0, 100),
      descripcion: `Registras ${fmtH(state.sueno)} de sueño; la referencia de la app es ${fmtH(CFG.metaSueno)}.`,
    },
    {
      tipo: "actividad",
      cumplimiento: clamp((state.actividad / CFG.metaActividad) * 100, 0, 100),
      descripcion: `Llevas ${state.actividad} min de actividad; la referencia de la app es ${CFG.metaActividad} min.`,
    },
    {
      tipo: "estres",
      cumplimiento: clamp((10 - state.estres) * 10, 0, 100),
      descripcion: `Tu nivel de estrés registrado es ${state.estres}/10.`,
    },
  ];
  return factores.sort((a, b) => a.cumplimiento - b.cumplimiento)[0];
}

function accionDeReferencia(tipo) {
  if (tipo === "sueno") return "Procura mantener un horario de sueño regular y acercarte a 8 h de descanso.";
  if (tipo === "actividad") return "Añade una caminata breve a tu rutina, a un ritmo que te resulte cómodo.";
  return "Haz una pausa de 10 min para respirar con calma y desconectarte un momento.";
}

function objetivoPersonalizado(recomendacion) {
  if (recomendacion.referencia) {
    if (recomendacion.tipo === "sueno") return `Esta noche, procura acercarte a ${fmtH(CFG.metaSueno)} de sueño con un horario regular.`;
    if (recomendacion.tipo === "actividad") return `Hoy, agrega 15 min de movimiento a tus ${state.actividad} min actuales.`;
    return "Hoy, reserva 10 min para una pausa de respiración consciente.";
  }
  if (recomendacion.tipo === "sueno") return `Esta noche, intenta dormir ${fmtH(recomendacion.valor)}.`;
  if (recomendacion.tipo === "actividad") return `Hoy, intenta llegar a ${recomendacion.valor} min de actividad.`;
  return `Hoy, reserva un momento para acercarte a ${recomendacion.valor}/10 de estrés.`;
}

function renderRecs() {
  const score = toScore(state.raw);
  const estado = score >= 225
    ? { nombre: "Excelente", clase: "excelente" }
    : score >= 150
      ? { nombre: "Bueno", clase: "bueno" }
      : score >= 90
        ? { nombre: "Moderado", clase: "moderado" }
        : { nombre: "Bajo", clase: "bajo" };
  const factor = obtenerFactorLimitante();
  const accionPrincipal = state.recs[0] || { tipo: factor.tipo, referencia: true };
  const accionSecundaria = state.recs.find((r) => r.tipo !== accionPrincipal.tipo) || {
    tipo: ["sueno", "actividad", "estres"].find((tipo) => tipo !== accionPrincipal.tipo),
    referencia: true,
  };
  const textoAccion = (accion) => accion.referencia
    ? accionDeReferencia(accion.tipo)
    : textoRec(accion).txt;

  $("estado-general").textContent = `Estado general: ${estado.nombre}`;
  $("estado-general").className = `estado-general ${estado.clase}`;
  const factorTitulo = $("factor-limitante").previousElementSibling;
  if (estado.nombre === "Excelente") {
    factorTitulo.textContent = "Tu bienestar actual";
    $("factor-limitante").textContent = "✅ No se identifican factores limitantes relevantes.";
    $("accion-prioritaria").textContent = "✅ Mantén tus hábitos actuales.";
    $("accion-secundaria").textContent = "Continúa con tus rutinas y escucha las necesidades de tu cuerpo.";
    $("objetivo-personalizado").textContent = "Mantén la constancia en los hábitos que contribuyen a tu bienestar.";
    $("card-opt").hidden = false;
    return;
  }
  factorTitulo.textContent = "Factor principal que limita tu bienestar";
  $("factor-limitante").textContent = factor.descripcion;
  $("accion-prioritaria").textContent = textoAccion(accionPrincipal);
  $("accion-secundaria").textContent = textoAccion(accionSecundaria);
  $("objetivo-personalizado").textContent = objetivoPersonalizado(accionPrincipal);
  $("card-opt").hidden = false;
}

function renderAgenda() {
  if (state.raw !== null && toScore(state.raw) >= 225) {
    $("agenda").innerHTML = [
      `<li><span class="ri">✅</span><div><b>MANTÉN TUS HÁBITOS</b>Conserva las rutinas que te están haciendo bien.</div></li>`,
      `<li><span class="ri">🌿</span><div><b>CUIDA TU EQUILIBRIO</b>Continúa atendiendo tu descanso, movimiento y bienestar emocional.</div></li>`,
    ].join("");
    return;
  }
  const items = [];
  const est = state.recs.find((r) => r.tipo === "estres");
  const act = state.recs.find((r) => r.tipo === "actividad");
  const sue = state.recs.find((r) => r.tipo === "sueno");
  if (est) items.push(["🪷", "PAUSA CONSCIENTE", textoRec(est).txt]);
  if (act) items.push(["🚶", "ACTIVIDAD", textoRec(act).txt]);
  if (sue) items.push(["🌙", "SUEÑO", textoRec(sue).txt]);
  $("agenda").innerHTML = items.length
    ? items.map(([i, t, d]) => `<li><span class="ri">${i}</span><div><b>${t}</b>${d}</div></li>`).join("")
    : `<li class="vacio">No hay acciones pendientes: ¡sigue así!</li>`;
}

// =====================================================
// FLUJO PRINCIPAL
// =====================================================
async function analizar(btn) {
  const error = $("error");
  const original = btn.textContent;
  error.hidden = true; btn.disabled = true; btn.textContent = "CALCULANDO…";
  try {
    state.raw = await predecirRaw(state.sueno, state.actividad, state.estres);
    const score = toScore(state.raw);
    setGauge("home", score); setGauge("prog", score);
    actualizarAnillos();
    state.recs = await calcularRecomendaciones(state.raw);
    renderRecs(); renderAgenda();
    simular();
  } catch (err) {
    error.textContent = err instanceof TypeError
      ? "No se pudo conectar con la API. Revisa que Docker esté corriendo y que el backend tenga CORS (Ajustes)."
      : err.message;
    error.hidden = false;
    document.querySelector('[data-view="home"]').click();
  } finally {
    btn.disabled = false; btn.textContent = original;
  }
}

// =====================================================
// SIMULADOR DE ESCENARIOS
// =====================================================
let simTimer;
function simular() {
  clearTimeout(simTimer);
  const s = +$("s-sueno").value, a = +$("s-actividad").value, e = +$("s-estres").value;
  $("sv-sueno").textContent = fmtH(s);
  $("sv-actividad").textContent = `${a} min`;
  $("sv-estres").textContent = `${e}/10`;
  if (state.raw === null) return;
  simTimer = setTimeout(async () => {
    try {
      const raw = await predecirRaw(s, a, e);
      const nuevo = toScore(raw), actual = toScore(state.raw);
      const d = Math.round(nuevo - actual);
      $("sim-actual").textContent = Math.round(actual);
      $("sim-nuevo").textContent = Math.round(nuevo);
      const el = $("sim-delta");
      el.textContent = (d > 0 ? "+" : "") + d;
      el.className = "delta " + (d > 0 ? "pos" : d < 0 ? "neg" : "");
      $("sim-text").textContent = `Si duermes ${fmtH(s)}, haces ${a} min de actividad y tu estrés es ${e}/10…`;
    } catch { /* sin conexión: se ignora */ }
  }, 300);
}

// =====================================================
// UI: sliders, pestañas, ajustes
// =====================================================
function bindSlider(id, key, fmt) {
  const el = $(id);
  el.addEventListener("input", () => {
    state[key] = +el.value;
    $(`v-${key}`).textContent = fmt(+el.value);
    actualizarAnillos();
  });
}
bindSlider("sueno", "sueno", fmtH);
bindSlider("actividad", "actividad", (v) => `${v} min`);
bindSlider("estres", "estres", (v) => `${v}/10`);
["s-sueno", "s-actividad", "s-estres"].forEach((id) => $(id).addEventListener("input", simular));

document.querySelectorAll(".tab").forEach((t) =>
  t.addEventListener("click", () => {
    document.querySelectorAll(".tab").forEach((x) => x.classList.toggle("active", x === t));
    document.querySelectorAll(".screen").forEach((s) => s.classList.toggle("active", s.id === `view-${t.dataset.view}`));
  })
);

$("btn-predict").addEventListener("click", (e) => analizar(e.currentTarget));
$("btn-analyze").addEventListener("click", (e) => analizar(e.currentTarget));

$("rawMin").addEventListener("change", (e) => { CFG.rawMin = +e.target.value; if (state.raw !== null) analizar($("btn-predict")); });
$("rawMax").addEventListener("change", (e) => { CFG.rawMax = +e.target.value; if (state.raw !== null) analizar($("btn-predict")); });

$("btn-ping").addEventListener("click", async () => {
  const st = $("ping-state");
  st.className = "ping"; st.textContent = "Probando…";
  try {
    const d = await (await fetch(`${apiUrl()}/`)).json();
    st.className = "ping ok"; st.textContent = "✔ " + (d.mensaje || "Conectado");
  } catch {
    st.className = "ping fail"; st.textContent = "✖ Sin conexión. ¿Docker encendido y CORS habilitado?";
  }
});

// ---- inicio ----
$("apiUrl").value = window.BIENESTAR_API_URL || localStorage.getItem(API_URL_STORAGE_KEY) || "/api";
$("apiUrl").addEventListener("change", () => {
  const url = apiUrl();
  $("apiUrl").value = url;
  if (url) localStorage.setItem(API_URL_STORAGE_KEY, url);
  else localStorage.removeItem(API_URL_STORAGE_KEY);
});
// Instalable como app (PWA) cuando se sirve por http(s)
if ("serviceWorker" in navigator && location.protocol.startsWith("http")) {
  navigator.serviceWorker.register("sw.js").catch(() => {});
}
$("gauge-home").innerHTML = gaugeHTML("home");
$("gauge-prog").innerHTML = gaugeHTML("prog");
$("ring-sueno").innerHTML = ringHTML("#5b6ee1", "ring-sueno");
$("ring-act").innerHTML = ringHTML("#2fa36b", "ring-act");
$("ring-mental").innerHTML = ringHTML("#35b4c9", "ring-mental");
actualizarAnillos();
