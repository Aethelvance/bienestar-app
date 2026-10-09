# Bienestar

Aplicación de bienestar con una API Flask y un frontend estático servido por Nginx.

## Estructura activa (hexagonal / clean)

```text
bienestar/
├── backend/                  # API Flask (hexagonal)
│   ├── app.py                # entrypoint (gunicorn app:app)
│   ├── modelo_bienestar.joblib
│   ├── requirements.txt
│   ├── Dockerfile
│   ├── src/
│   │   ├── domain/           # núcleo: entities.py, ports.py
│   │   ├── application/      # casos de uso: predict_use_case.py
│   │   ├── infrastructure/
│   │   │   ├── ml/           # adaptador sklearn_adapter.py
│   │   │   └── web/          # adaptador Flask flask_app.py
│   │   └── config/           # settings.py (PORT, CORS)
│   └── tests/
├── frontend/                 # web estática (solo HTML/CSS/JS, sin npm)
│   ├── index.html
│   ├── css/
│   ├── js/
│   ├── manifest.json
│   ├── sw.js
│   ├── icon.svg
│   ├── nginx.conf
│   └── Dockerfile
├── docker-compose.yml
├── .dockerignore
└── README.md
```

## Ejecución local con Docker

Desde la raíz del proyecto:

```powershell
docker compose up --build
```

Abre <http://localhost:8080>. Nginx sirve el frontend y reenvía las solicitudes `/api/` a Flask. La API también se publica en <http://localhost:5001>.

Para detener los servicios, usa `Ctrl+C` y luego:

```powershell
docker compose down
```

## Variables de entorno

- `PORT`: puerto del backend; por defecto `5001` en Compose.
- `CORS_ALLOWED_ORIGINS`: orígenes permitidos separados por comas cuando el frontend se publica en otro dominio. El frontend y la API servidos juntos por Nginx usan el proxy `/api/` del mismo origen.

## Render

Despliega `backend/` como servicio Docker para la API y `frontend/` como sitio estático si se desea servirlos por separado. Configura `CORS_ALLOWED_ORIGINS` con el origen HTTPS exacto del sitio y establece la URL pública del backend en los ajustes del frontend.

El modelo, el pipeline y la lógica de predicción permanecen en el backend sin cambios de contrato (`GET /`, `POST /predict`).
