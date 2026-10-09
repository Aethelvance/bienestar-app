// Cliente HTTP mínimo: todas las llamadas van a /api (nginx las
// reenvía al backend en Docker; en `npm run dev` las proxea Vite).

async function json(res) {
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.error || `HTTP ${res.status}`);
  return data;
}

export const getHealth = () => fetch("/api/health").then(json);

export const getInfo = () => fetch("/api/info").then(json);

export function predict({ actividadHoras, sueno, estres }) {
  return fetch("/api/predict", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ actividad: actividadHoras, sueno, estres }),
  }).then(json);
}
