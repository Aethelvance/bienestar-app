"""Adaptador de entrada: app Flask (puerto primario HTTP)."""

from flask import Flask, jsonify, request

from src.application.get_model_info import GetModelInfoUseCase
from src.application.predict_use_case import PredictBienestarUseCase
from src.config.settings import Settings


def create_app(
    use_case: PredictBienestarUseCase,
    settings: Settings,
    info_use_case: GetModelInfoUseCase,
) -> Flask:
    app = Flask(__name__)

    @app.after_request
    def agregar_cors(respuesta):
        origen = request.headers.get("Origin", "").rstrip("/")
        if origen and origen in settings.cors_allowed_origins:
            respuesta.headers["Access-Control-Allow-Origin"] = origen
            respuesta.headers["Access-Control-Allow-Headers"] = "Content-Type"
            respuesta.headers["Access-Control-Allow-Methods"] = "GET, POST, OPTIONS"
            respuesta.headers.add("Vary", "Origin")
        return respuesta

    @app.route("/", methods=["GET"])
    def home():
        return jsonify(
            {"mensaje": "API del modelo de bienestar funcionando correctamente"}
        )

    @app.route("/health", methods=["GET"])
    def health():
        return jsonify({"status": "ok", "service": "bienestar-api"})

    @app.route("/info", methods=["GET"])
    def info():
        try:
            return jsonify(info_use_case.execute())
        except Exception as exc:  # noqa: BLE001 - contrato JSON estable
            return jsonify({"error": f"Error interno: {str(exc)}"}), 500

    @app.route("/predict", methods=["POST"])
    def predict():
        try:
            data = request.get_json(silent=True)
            if not data:
                return jsonify({"error": "No se enviaron datos"}), 400
            if not all(k in data for k in ("actividad", "sueno", "estres")):
                return jsonify(
                    {"error": "Faltan variables requeridas: actividad, sueno y estres"}
                ), 400
            try:
                resultado = use_case.execute(
                    data["actividad"], data["sueno"], data["estres"]
                )
            except ValueError as exc:
                return jsonify({"error": str(exc)}), 400
            return jsonify(resultado.to_dict())
        except Exception as exc:  # noqa: BLE001 - contrato JSON estable
            return jsonify({"error": f"Error interno: {str(exc)}"}), 500

    return app
