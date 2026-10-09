"""Entidades del dominio de bienestar (núcleo hexagonal, sin dependencias externas)."""

from dataclasses import dataclass


# Nombres de variables que expone el pipeline, en el orden exacto de
# ColumnTransformer.get_feature_names_out() (9 coeficientes):
# actividad², sueno², estres², actividad, sueno, estres,
# actividad×sueno, actividad×estres, sueno×estres.
NOMBRES_VARIABLES = [
    "actividad2",
    "sueno2",
    "estres2",
    "actividad",
    "sueno",
    "estres",
    "actividad_sueno",
    "actividad_estres",
    "sueno_estres",
]


@dataclass(frozen=True)
class BienestarInput:
    """Datos de entrada validados del caso de uso."""

    actividad: float
    sueno: float
    estres: float


@dataclass(frozen=True)
class BienestarResult:
    """Resultado del caso de uso (contrato estable para el frontend)."""

    actividad: float
    sueno: float
    estres: float
    bienestar_estimado: float
    intercepto_escalado: float
    pesos_escalados: dict
    intercepto_real: float
    pesos_reales: dict

    def to_dict(self) -> dict:
        return {
            "entrada": {
                "actividad": self.actividad,
                "sueno": self.sueno,
                "estres": self.estres,
            },
            "bienestar_estimado": round(float(self.bienestar_estimado), 2),
            "coeficientes_escalados": {
                "explicacion": "Pesos relativos estandarizados para comparar la influencia de cada variable.",
                "intercepto_escalado": float(self.intercepto_escalado),
                "coeficientes": dict(self.pesos_escalados),
            },
            "coeficientes_escala_real": {
                "explicacion": "Coeficientes expresados en unidades reales.",
                "intercepto_real": float(self.intercepto_real),
                "coeficientes": dict(self.pesos_reales),
            },
        }
