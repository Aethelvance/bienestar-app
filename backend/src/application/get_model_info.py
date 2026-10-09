"""Caso de uso: describir el modelo (capa application, sin Flask ni sklearn)."""

from src.domain.ports import BienestarModelPort


class GetModelInfoUseCase:
    """Devuelve la metadata del modelo para el endpoint /info."""

    def __init__(self, model: BienestarModelPort):
        self._model = model

    def execute(self) -> dict:
        return {"service": "bienestar-api", "model": self._model.describe()}
