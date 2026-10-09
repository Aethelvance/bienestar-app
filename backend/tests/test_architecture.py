"""Tests de arquitectura: la regla de dependencias sobrevive a refactors.

Matriz exigible (Clean/Hexagonal):
  domain       -> solo stdlib + dominio
  application  -> stdlib + dominio (nunca infraestructura ni frameworks)
  infrastructure/config/app -> pueden depender hacia adentro

Sin dependencias nuevas (solo stdlib: ast/pathlib).
"""

import ast
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parents[1]))

SRC = Path(__file__).resolve().parents[1] / "src"

# Frameworks y librerías externas prohibidas en el núcleo.
FRAMEWORKS = {"flask", "pandas", "sklearn", "joblib", "numpy", "gunicorn"}


def _imports(path: Path) -> tuple[set, set]:
    """Devuelve (imports_externos, imports_src_internos) del archivo."""
    tree = ast.parse(path.read_text(encoding="utf-8"))
    externos, internos = set(), set()
    for node in ast.walk(tree):
        if isinstance(node, ast.Import):
            for alias in node.names:
                top = alias.name.split(".")[0]
                (internos if top == "src" else externos).add(top)
        elif isinstance(node, ast.ImportFrom) and node.module:
            if node.module == "src" or node.module.startswith("src."):
                internos.add(node.module)
            else:
                externos.add(node.module.split(".")[0])
    return externos, internos


def _nucleo_archivos(capa: str):
    return [
        f for f in (SRC / capa).rglob("*.py")
        if "__pycache__" not in f.parts
    ]


def test_dominio_sin_frameworks():
    for f in _nucleo_archivos("domain"):
        externos, _ = _imports(f)
        assert not (externos & FRAMEWORKS), (
            f"{f.name} importa frameworks: {sorted(externos & FRAMEWORKS)}"
        )


def test_dominio_no_conoce_capas_externas():
    for f in _nucleo_archivos("domain"):
        _, internos = _imports(f)
        malas = [m for m in internos if not m.startswith("src.domain")]
        assert not malas, f"{f.name} depende de capas externas: {malas}"


def test_aplicacion_sin_frameworks_ni_infraestructura():
    for f in _nucleo_archivos("application"):
        externos, internos = _imports(f)
        assert not (externos & FRAMEWORKS), (
            f"{f.name} importa frameworks: {sorted(externos & FRAMEWORKS)}"
        )
        malas = [
            m for m in internos
            if m.startswith("src.infrastructure") or m.startswith("src.config")
        ]
        assert not malas, f"{f.name} depende de infraestructura: {malas}"


if __name__ == "__main__":
    test_dominio_sin_frameworks()
    test_dominio_no_conoce_capas_externas()
    test_aplicacion_sin_frameworks_ni_infraestructura()
    print("architecture tests OK")
