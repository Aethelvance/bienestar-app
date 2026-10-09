"""Caso de uso: predecir bienestar (capa application, sin Flask ni sklearn).

Solo depende del dominio: ni pandas ni joblib aparecen aquí. El puerto
recibe entidades puras y el adaptador se encarga de traducir a DataFrame.
"""

from src.domain.entities import NOMBRES_VARIABLES, BienestarInput, BienestarResult
from src.domain.ports import BienestarModelPort


class PredictBienestarUseCase:
    """Orquesta validación + predicción + coeficientes reales/escalados."""

    def __init__(self, model: BienestarModelPort):
        self._model = model

    def execute(self, actividad, sueno, estres) -> BienestarResult:
        self._validar(actividad, sueno, estres)
        entrada = BienestarInput(
            actividad=actividad, sueno=sueno, estres=estres
        )
        prediccion = float(self._model.predict(entrada))

        coef_escalados = self._model.coef_escalados
        intercepto_escalado = float(self._model.intercepto_escalado)
        medias = self._model.medias
        desviaciones = self._model.desviaciones

        pesos_escalados = dict(
            zip(NOMBRES_VARIABLES, [float(c) for c in coef_escalados])
        )
        coef_reales = coef_escalados / desviaciones
        intercepto_real = float(
            intercepto_escalado - sum((coef_escalados * medias) / desviaciones)
        )
        pesos_reales = dict(zip(NOMBRES_VARIABLES, [float(c) for c in coef_reales]))

        return BienestarResult(
            actividad=entrada.actividad,
            sueno=entrada.sueno,
            estres=entrada.estres,
            bienestar_estimado=prediccion,
            intercepto_escalado=intercepto_escalado,
            pesos_escalados=pesos_escalados,
            intercepto_real=intercepto_real,
            pesos_reales=pesos_reales,
        )

    @staticmethod
    def _validar(actividad, sueno, estres) -> None:
        if actividad is None or sueno is None or estres is None:
            raise ValueError("Faltan variables requeridas: actividad, sueno y estres")
        if not all(isinstance(v, (int, float)) for v in (actividad, sueno, estres)):
            raise ValueError("actividad, sueno y estres deben ser valores numéricos")
