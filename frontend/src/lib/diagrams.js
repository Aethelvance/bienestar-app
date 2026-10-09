// Diagramas Mermaid del proyecto: el rigor de un diagrama técnico, con
// NUESTRO contexto real. Regla de honestidad: solo aparece lo que el
// artefacto o el código demuestran; lo desconocido va en nodos ❌.

const ESTILOS = `
  classDef std fill:#E3DDFF,stroke:#22344A,stroke-width:2.5px,color:#22344A
  classDef sky fill:#DCEFFF,stroke:#22344A,stroke-width:2.5px,color:#22344A
  classDef ok fill:#D2F1E2,stroke:#22344A,stroke-width:2.5px,color:#22344A
  classDef no fill:#FFE1D6,stroke:#22344A,stroke-width:2.5px,color:#22344A
  classDef sun fill:#FFE3C2,stroke:#22344A,stroke-width:2.5px,color:#22344A
`;

// 1. Qué problema resuelve el modelo (como el ej. 1 de referencia).
export function diagProblema() {
  return `flowchart TD
  D["🎯 Entrada tabular<br/>3 numéricos — actividad h, sueño h, estrés 0-10<br/>salida continua — bienestar"]
  T["🎯 Tipo — regresión supervisada tabular<br/>X numérica → y continua<br/>NO encoder · NO refuerzo"]
  S["✂️ Split train/val/test<br/>NO registrado en el .joblib<br/>el reparto no se puede afirmar"]
  E["❌ Encoder es compresión o embeddings<br/>para texto o secuencias, NO 3 columnas"]
  R["❌ Refuerzo es agente + recompensa<br/>sin y etiquetada, NO aplica"]
  Z["⚖️ StandardScaler<br/>μ y σ guardados en el .joblib<br/>z = x − mean / std"]
  TR["🏋️ Train — de aquí salen<br/>μ, σ y los 10 params<br/>OLS sin epochs"]
  VA["🔍 Val — tuning<br/>métricas NO registradas"]
  TE["🧪 Test final<br/>MAE RMSE R2 NO registrados"]
  D --> T
  T --> S
  T -.-> E
  T -.-> R
  S --> Z
  Z --> TR
  Z --> VA
  Z --> TE
  class D,T std
  class S,Z,TR sky
  class E,R no
  class VA,TE sun
${ESTILOS}`;
}

// 2. El pipeline paso a paso con conteo de parámetros (como el ej. 2).
// Los conteos salen de /info en vivo; los nombres, del ColumnTransformer.
export function diagPipeline(info) {
  const m = info?.model;
  const n = m?.n_coefficients ?? 9;
  const grupos = (m?.feature_engineering?.groups ?? [
    "actividad2",
    "sueno2",
    "estres2",
    "interacciones",
  ])
    .join(" · ")
    .toUpperCase();
  const est = (m?.estimator ?? "LinearRegression").toUpperCase();
  const parsModelo = n + 1;
  const total = 18 + parsModelo;
  return `flowchart TD
  IN["🟢 INPUT 3<br/>actividad h · sueño h · estrés 0-10<br/>DataFrame de 1 fila"]
  PF["🟣 POLYNOMIALFEATURES grado 2<br/>${grupos}<br/>3 → ${n} columnas"]
  F9["9 FEATURES REALES<br/>act² · sueño² · estrés²<br/>act · sueño · estrés<br/>act×sueño · act×estrés · sueño×estrés"]
  SC["⚖️ STANDARDSCALER<br/>9 μ + 9 σ = 18 params<br/>z = x − mean / std"]
  LR["🔵 ${est}<br/>${n} coefs + 1 intercepto = ${parsModelo} params<br/>OLS solución cerrada, sin lr"]
  OUT["🔴 OUTPUT continuo<br/>bienestar crudo ej −79.06<br/>frontend lo mapea a 0–300"]
  TOT["📦 ${total} números aprendidos<br/>18 scaler + ${parsModelo} modelo<br/>PolynomialFeatures aporta 0"]
  IN --> PF
  PF --> F9
  F9 --> SC
  SC --> LR
  LR --> OUT
  LR -.-> TOT
  SC -.-> TOT
  class IN,PF std
  class F9,SC sky
  class LR ok
  class OUT sun
  class TOT std
${ESTILOS}`;
}

// 3. Cómo se entrenó: OLS no tiene epochs (a diferencia del ej. 3).
export function diagEntreno() {
  return `flowchart TD
  M["📦 modelo_bienestar.joblib<br/>3.5 KB · sklearn 1.9.0<br/>pipeline ya ajustado"]
  OLS["➗ OLS mínimos cuadrados<br/>minimiza el error cuadrático vía SVD<br/>solución cerrada — sin epochs, sin lr"]
  P["🔵 10 params del modelo<br/>9 coefs + 1 intercepto"]
  S["⚖️ 18 params del scaler<br/>9 μ + 9 σ"]
  D1["❌ Dataset NO disponible<br/>filas y origen<br/>no vienen en el .joblib"]
  D2["❌ Split y métricas NO registrados<br/>MAE RMSE R2 ausentes<br/>por eso /info no los publica"]
  M --> OLS
  OLS --> P
  OLS --> S
  M -.-> D1
  M -.-> D2
  class M std
  class OLS,P,S sky
  class D1,D2 no
${ESTILOS}`;
}

// 4. Arquitectura hexagonal de la API (como el ej. 4).
export function diagApi() {
  return `flowchart TD
  C["👤 CLIENTE React<br/>sliders → fetch /api<br/>mismo origen puerto 8080"]
  N["🌐 NGINX puerto 8080<br/>sirve dist/ y proxea /api/<br/>sin CORS de por medio"]
  F["⚙️ FLASK + gunicorn puerto 5001<br/>create_app + CORS<br/>carga el .joblib 1 vez en startup"]
  H["💚 GET /health<br/>status ok + service<br/>200 si la API vive"]
  I["ℹ️ GET /info<br/>describe() real del pipeline<br/>familia, pasos, 9 coefs"]
  P["➕ POST /predict<br/>body 3 floats<br/>score + coefs ×2 escalas"]
  U["📐 CASO DE USO<br/>PredictBienestarUseCase<br/>sin sklearn dentro"]
  A["📦 ADAPTER sklearn<br/>arma el DataFrame<br/>corre el pipeline"]
  X["❌ Training fuera de inferencia<br/>la API nunca re-entrena<br/>solo lectura del .joblib"]
  C --> N
  N --> F
  F --> H
  F --> I
  F --> P
  P --> U
  U --> A
  F -.-> X
  class C,N std
  class F,U,A sky
  class H,I ok
  class P sun
  class X no
${ESTILOS}`;
}

// 5. Flujo de una predicción con ejemplo real (como el ej. 5).
export function diagPredict() {
  return `flowchart TD
  R["📥 POST /predict<br/>actividad 0.75 · sueño 6.5 · estrés 8<br/>JSON de 3 floats"]
  V["✅ VALIDA tipos<br/>los 3 campos numéricos<br/>requeridos"]
  F1["❌ 400 sin datos<br/>cuerpo vacío"]
  F2["❌ 400 campos o tipos<br/>faltan o no numéricos"]
  DF["🐼 DATAFRAME 1 fila<br/>columnas act, sueño, estrés"]
  PR["🔮 PIPELINE.PREDICT<br/>9 feats → OLS → crudo<br/>ej −79.06"]
  OK["📦 200 OK<br/>bienestar + entrada<br/>+ 9 coefs ×2 escalas"]
  R --> V
  V -- "vacío" --> F1
  V -- "incompleto o texto" --> F2
  V -- "ok" --> DF
  DF --> PR
  PR --> OK
  class R,V std
  class F1,F2 no
  class DF,PR sky
  class OK ok
${ESTILOS}`;
}

// 6. Health, info y despliegue (como el ej. 6).
export function diagDeploy() {
  return `flowchart TD
  D["🐳 DOCKER COMPOSE<br/>api puerto 5001 · web puerto 8080<br/>red bienestar-app_default"]
  G["🚀 GUNICORN<br/>bind 0.0.0.0 puerto 5001<br/>app:app"]
  L["📦 CARGA 1 vez<br/>joblib.load en startup<br/>CPU, sin GPU"]
  H["💚 GET /health<br/>status ok + service<br/>200 si API viva"]
  I["ℹ️ GET /info<br/>metadata del pipeline<br/>9 coefs, pasos, grupos"]
  W["🌐 NGINX web<br/>sirve dist/ del build<br/>/api/ → api:5001"]
  M["❌ Sin métricas de train<br/>MAE RMSE R2 no existen<br/>en el artefacto"]
  D --> G
  D --> W
  W -- "/api/" --> G
  G --> L
  L --> H
  L --> I
  L -.-> M
  class D,G,W std
  class L sky
  class H,I ok
  class M no
${ESTILOS}`;
}
