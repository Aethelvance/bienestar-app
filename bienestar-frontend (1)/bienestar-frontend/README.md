# Bienestar · App (frontend)

Interfaz tipo app móvil en HTML + CSS + JS puro (sin npm). Consume la API Flask del proyecto `bienestar`.

Pantallas: **Inicio** (score, hábitos, optimización), **Progreso** (anillos, agenda, simulador), **Ajustes** (API y escala).

## Abrir en IntelliJ IDEA
1. `File > Open…` y selecciona esta carpeta.
2. Abre `index.html` y pulsa el icono de navegador (servidor integrado, `http://localhost:63342/...`).

## Backend
1. Reemplaza `bienestar/app.py` por `backend-cors/app.py` (solo añade CORS).
2. `docker compose up --build` en `bienestar/` (puerto 5001).
3. Ajustes > Probar conexión.

## Cómo funcionan las recomendaciones
Al pulsar «Predecir y optimizar» la app llama a `/predict` con tus hábitos y con ~11 escenarios
(más sueño, más actividad, menos estrés) y muestra los que más puntos suman. El modelo recibe la
actividad en **horas** (la app la convierte desde minutos).

## Escala
El modelo devuelve valores aprox. entre -250 y 350; se mapean a 0–300 con `rawMin`/`rawMax`
(Ajustes o `CFG` en `js/app.js`).
