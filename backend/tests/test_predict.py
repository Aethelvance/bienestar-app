"""Smoke test del caso de uso (usa un modelo falso: el puerto es agnóstico)."""

import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parents[1]))

from src.application.predict_use_case import PredictBienestarUseCase


class FakeModel:
    def predict(self, entrada):
        assert entrada.actividad == 1.0
        assert entrada.sueno == 8.0
        assert entrada.estres == 5.0
        return 123.456

    @property
    def coef_escalados(self):
        import numpy as np

        return np.array([1.0, 2.0, 3.0, 4.0, 5.0, 6.0, 7.0, 8.0, 9.0])

    @property
    def intercepto_escalado(self):
        return 10.0

    @property
    def medias(self):
        import numpy as np

        return np.zeros(9)

    @property
    def desviaciones(self):
        import numpy as np

        return np.ones(9)


def test_use_case_ok():
    uc = PredictBienestarUseCase(FakeModel())
    res = uc.execute(1.0, 8.0, 5.0)
    d = res.to_dict()
    assert d["bienestar_estimado"] == 123.46
    assert set(d["coeficientes_escalados"]["coeficientes"]) == {
        "actividad2", "sueno2", "estres2", "actividad", "sueno", "estres",
        "actividad_sueno", "actividad_estres", "sueno_estres",
    }


def test_use_case_valida_tipos():
    uc = PredictBienestarUseCase(FakeModel())
    try:
        uc.execute("mal", 8.0, 5.0)
    except ValueError:
        return
    raise AssertionError("debió fallar con tipo inválido")


if __name__ == "__main__":
    test_use_case_ok()
    test_use_case_valida_tipos()
    print("tests OK")
