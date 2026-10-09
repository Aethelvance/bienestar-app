"""Adaptador ML: pipeline scikit-learn cargado desde joblib.

Es el único lugar que conoce pandas/DataFrames: traduce la entidad pura
del dominio al formato que espera el pipeline (puertos fuertes).
"""

from pathlib import Path

import joblib
import pandas as pd

from src.domain.entities import BienestarInput
from src.domain.ports import BienestarModelPort


class SklearnBienestarAdapter(BienestarModelPort):
    """Implementa el puerto del dominio con el pipeline entrenado."""

    def __init__(self, model_path: str | Path):
        self._pipeline = joblib.load(str(model_path))
        regresion = self._pipeline.named_steps["model"]
        escalador = self._pipeline.named_steps["scaler"]
        self._coef = regresion.coef_
        self._intercepto = float(regresion.intercept_)
        self._medias = escalador.mean_
        self._desviaciones = escalador.scale_

    def predict(self, entrada: BienestarInput) -> float:
        df_entrada = pd.DataFrame(
            [{
                "actividad": entrada.actividad,
                "sueno": entrada.sueno,
                "estres": entrada.estres,
            }]
        )
        return float(self._pipeline.predict(df_entrada)[0])

    @property
    def coef_escalados(self):
        return self._coef

    @property
    def intercepto_escalado(self) -> float:
        return self._intercepto

    @property
    def medias(self):
        return self._medias

    @property
    def desviaciones(self):
        return self._desviaciones

    def describe(self) -> dict:
        """Lee la metadata directamente del pipeline (nada hardcodeado)."""
        pasos = self._pipeline.named_steps
        estimador = type(pasos["model"]).__name__
        return {
            "family": self._family(pasos),
            "estimator": estimador,
            "pipeline_steps": list(pasos.keys()),
            "feature_engineering": self._feature_summary(pasos),
            "n_coefficients": int(len(self._coef)),
            "input_variables": ["actividad", "sueno", "estres"],
            "target": "bienestar_estimado",
        }

    @staticmethod
    def _family(pasos) -> str:
        """Familia del modelo según qué piezas trae el pipeline."""
        feats = pasos.get("features")
        usa_polinomios = feats is not None and any(
            type(t).__name__ == "PolynomialFeatures"
            for _, t, _ in feats.transformers
        )
        if usa_polinomios:
            return "polynomial_regression"
        return type(pasos["model"]).__name__.lower()

    @staticmethod
    def _feature_summary(pasos) -> dict:
        feats = pasos.get("features")
        if feats is None:
            return {"transformers": [], "groups": []}
        return {
            "transformers": sorted({type(t).__name__ for _, t, _ in feats.transformers}),
            "groups": [nombre for nombre, _, _ in feats.transformers],
        }


def default_model_path() -> Path:
    """El modelo vive en backend/modelo_bienestar.joblib (junto al Dockerfile)."""
    return Path(__file__).resolve().parents[3] / "modelo_bienestar.joblib"
