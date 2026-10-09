"""Puertos del dominio (interfaces que la infraestructura debe implementar).

Puerto FUERTE (tecnología-agnóstico): trabaja con entidades del dominio,
nunca con DataFrames ni tipos de sklearn/pandas. El adaptador traduce.
"""

from abc import ABC, abstractmethod
from typing import Any

from src.domain.entities import BienestarInput


class BienestarModelPort(ABC):
    """Puerto de salida: cualquier modelo ML que prediga bienestar."""

    @abstractmethod
    def predict(self, entrada: BienestarInput) -> float:
        """Predice bienestar a partir de conceptos puros del dominio."""
        raise NotImplementedError

    @property
    @abstractmethod
    def coef_escalados(self) -> Any:
        raise NotImplementedError

    @property
    @abstractmethod
    def intercepto_escalado(self) -> float:
        raise NotImplementedError

    @property
    @abstractmethod
    def medias(self) -> Any:
        raise NotImplementedError

    @property
    @abstractmethod
    def desviaciones(self) -> Any:
        raise NotImplementedError
