"""Punto de entrada del backend (compatible con gunicorn app:app)."""

import os

from src.application.get_model_info import GetModelInfoUseCase
from src.application.predict_use_case import PredictBienestarUseCase
from src.config.settings import Settings
from src.infrastructure.ml.sklearn_adapter import (
    SklearnBienestarAdapter,
    default_model_path,
)
from src.infrastructure.web.flask_app import create_app

settings = Settings.from_env()
model_path = os.environ.get("MODEL_PATH", str(default_model_path()))
adapter = SklearnBienestarAdapter(model_path)
use_case = PredictBienestarUseCase(adapter)
info_use_case = GetModelInfoUseCase(adapter)
app = create_app(use_case, settings, info_use_case)

if __name__ == "__main__":
    app.run(debug=False, host="0.0.0.0", port=settings.port)
