"""Configuración leída desde entorno (adaptador de configuración)."""

import os
from dataclasses import dataclass, field


@dataclass(frozen=True)
class Settings:
    port: int = int(os.environ.get("PORT", "5001"))
    cors_allowed_origins: frozenset = field(default_factory=frozenset)

    @classmethod
    def from_env(cls) -> "Settings":
        raw = os.environ.get("CORS_ALLOWED_ORIGINS", "")
        origins = frozenset(
            origin.strip().rstrip("/")
            for origin in raw.split(",")
            if origin.strip()
        )
        return cls(
            port=int(os.environ.get("PORT", "5001")),
            cors_allowed_origins=origins,
        )
