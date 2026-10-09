// Lógica de lectura del bienestar: funciones puras, sin React ni fetch.
// Portadas del backup (js/app.js) pero SIN el motor de 9 recomendaciones:
// con una sola predicción basta, la lectura se deriva con reglas simples.

// El modelo devuelve valores crudos; aquí se mapean a un score 0-300.
export const SCORE = { rawMin: -250, rawMax: 350, max: 300 };

// Metas de referencia para detectar el factor limitante.
export const METAS = { sueno: 8, actividadMin: 60 };

const clamp = (v, a, b) => Math.min(b, Math.max(a, v));

export const toScore = (raw) =>
  clamp(((raw - SCORE.rawMin) / (SCORE.rawMax - SCORE.rawMin)) * SCORE.max, 0, SCORE.max);

export const fmtHoras = (h) => (Number.isInteger(h) ? `${h}` : h.toFixed(1)) + " h";

// Estado general según el score (mismos cortes que el backup).
export function estadoDe(score) {
  if (score >= 225) return { nombre: "Excelente", clase: "excelente" };
  if (score >= 150) return { nombre: "Bueno", clase: "bueno" };
  if (score >= 110) return { nombre: "Moderado", clase: "moderado" };
  return { nombre: "Bajo", clase: "bajo" };
}

// Factor limitante: la dimensión más lejos de su meta (0-100 por dimensión).
export function factorLimitante({ sueno, actividadMin, estres }) {
  const filas = [
    {
      tipo: "sueno",
      pct: clamp(100 - Math.abs(sueno - METAS.sueno) * 15, 0, 100),
      texto: `Duermes ${fmtHoras(sueno)}; la referencia es ${fmtHoras(METAS.sueno)}.`,
    },
    {
      tipo: "actividad",
      pct: clamp((actividadMin / METAS.actividadMin) * 100, 0, 100),
      texto: `Llevas ${actividadMin} min de actividad; la referencia es ${METAS.actividadMin} min.`,
    },
    {
      tipo: "estres",
      pct: clamp((10 - estres) * 10, 0, 100),
      texto: `Tu estrés registrado es ${estres}/10.`,
    },
  ];
  return filas.sort((a, b) => a.pct - b.pct)[0];
}

// Acción y objetivo según el factor limitante (reglas fijas y visibles).
export function accionPara(tipo) {
  if (tipo === "sueno") return "Acerca tu horario a 8 h de sueño con una hora fija para acostarte.";
  if (tipo === "actividad") return "Suma una caminata breve a tu rutina, a ritmo cómodo.";
  return "Reserva 10 min para respirar con calma y desconectarte.";
}

// Consejo coherente con el puntaje: el tono lo marca el tier del score
// y el contenido lo marca el factor limitante. Todo visible, sin magia.
export function consejoPara(tipo, score) {
  const s = Math.round(score);
  const base = accionPara(tipo);
  if (score >= 225) return `Vas excelente (${s}/300): mantén tu rutina, funciona. ${base}`;
  if (score >= 150) return `Vas bien (${s}/300): un ajuste te sube más. ${base}`;
  if (score >= 110) return `Puedes mejorar (${s}/300): ataca tu punto débil. ${base}`;
  return `Prioritario (${s}/300): cambia esto hoy mismo. ${base}`;
}

export function objetivoPara(tipo, { actividadMin }, score) {
  if (score >= 225) return "Mantén la constancia: repite mañana lo mismo que hoy.";
  if (tipo === "sueno") return `Esta noche, procura acercarte a ${fmtHoras(METAS.sueno)}.`;
  if (tipo === "actividad") return `Hoy, agrega 15 min a tus ${actividadMin} min actuales.`;
  return "Hoy, reserva 10 min para una pausa de respiración consciente.";
}
