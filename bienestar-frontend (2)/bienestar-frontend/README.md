# Bienestar · Aplicativo web (PC + móvil)

Web responsive en HTML + CSS + JS puro (sin npm):
- **PC / laptop (≥ 900 px):** menú lateral y paneles en cuadrícula.
- **Celular / tablet:** vista tipo app con barra inferior.
- **Instalable** (PWA): en Chrome/Edge aparece "Instalar app" al servirla por http(s).

Pantallas: Inicio (score, hábitos, optimización) · Progreso (anillos, agenda, simulador) · Ajustes (API y escala).

## Opción A · Todo con Docker (recomendada)
Estructura:
```
proyecto/
├── app.py
├── Dockerfile
├── docker-compose.yml
├── modelo_bienestar.joblib
├── requirements.txt
└── bienestar-frontend (2)/
    └── bienestar-frontend/  <- frontend oficial con Nginx
```
Mantén esta copia como fuente oficial: `bienestar-frontend (1)` es una versión duplicada y puede eliminarse después de confirmar que no necesitas sus cambios propios. `.ipynb_checkpoints` también contiene archivos de respaldo, no necesarios para desplegar.
```
docker compose up --build
```
Abre http://localhost:8080 . Nginx sirve la web y reenvía `/api` a la API (mismo origen, **no necesita CORS**).
La API también queda disponible en http://localhost:5001.

## Opción B · Desarrollo en IntelliJ IDEA
1. `File > Open…` → esta carpeta. Abre `index.html` y pulsa el icono del navegador.
2. Levanta la API con `docker compose up` desde la raíz del proyecto.
3. En Ajustes, configura la URL local de la API si sirves el frontend desde otro origen.

## Despliegue en Render
1. Despliega la raíz como Web Service Docker. Render proporciona `PORT`; Gunicorn lo usa automáticamente.
2. Configura `CORS_ALLOWED_ORIGINS` con el origen HTTPS exacto del frontend, sin ruta (por ejemplo, `https://bienestar-web.onrender.com`).
3. Despliega esta carpeta como Static Site.
4. En Ajustes, introduce la URL HTTPS pública del backend y pulsa «Probar conexión». La URL queda guardada en el navegador.

Para fijar la URL al servir la app, define `window.BIENESTAR_API_URL` antes de cargar `js/app.js`.

## Recomendaciones
«Predecir y optimizar» llama a `/predict` con tus hábitos y ~8 escenarios alternativos (más sueño,
más actividad, menos estrés) y muestra los que más puntos suman. La actividad se envía en **horas**.

## Escala
El modelo devuelve ~ -250 a 350; se mapea a 0–300 con `rawMin`/`rawMax` (Ajustes o `CFG` en `js/app.js`).
