"""Tests del endpoint /info (sin Flask: caso de uso + adaptador real)."""

import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parents[1]))

from src.application.get_model_info import GetModelInfoUseCase
from src.infrastructure.ml.sklearn_adapter import SklearnBienestarAdapter


class FakeModel:
    def describe(self):
        return {"family": "fake", "estimator": "FakeEstimator"}


def test_info_envuelve_describe():
    uc = GetModelInfoUseCase(FakeModel())
    assert uc.execute() == {
        "service": "bienestar-api",
        "model": {"family": "fake", "estimator": "FakeEstimator"},
    }


def test_adapter_describe_real():
    adapter = SklearnBienestarAdapter(
        Path(__file__).resolve().parents[1] / "modelo_bienestar.joblib"
    )
    d = adapter.describe()
    assert d["family"] == "polynomial_regression"
    assert d["estimator"] == "LinearRegression"
    assert d["pipeline_steps"] == ["features", "scaler", "model"]
    assert d["n_coefficients"] == 9
    assert d["input_variables"] == ["actividad", "sueno", "estres"]
    assert d["target"] == "bienestar_estimado"


def test_coeficientes_alineados_con_dominio():
    """El dominio debe nombrar tantos coeficientes como trae el modelo."""
    from src.domain.entities import NOMBRES_VARIABLES

    adapter = SklearnBienestarAdapter(
        Path(__file__).resolve().parents[1] / "modelo_bienestar.joblib"
    )
    assert len(adapter.coef_escalados) == len(NOMBRES_VARIABLES)


if __name__ == "__main__":
    test_info_envuelve_describe()
    test_adapter_describe_real()
    print("info tests OK")
