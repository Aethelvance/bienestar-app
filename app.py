import os

from flask import Flask, request, jsonify
import joblib
import pandas as pd

app = Flask(__name__)

CORS_ALLOWED_ORIGINS = {
    origin.strip().rstrip("/")
    for origin in os.environ.get("CORS_ALLOWED_ORIGINS", "").split(",")
    if origin.strip()
}


@app.after_request
def agregar_cors(respuesta):
    origen = request.headers.get("Origin", "").rstrip("/")
    if origen and origen in CORS_ALLOWED_ORIGINS:
        respuesta.headers["Access-Control-Allow-Origin"] = origen
        respuesta.headers["Access-Control-Allow-Headers"] = "Content-Type"
        respuesta.headers["Access-Control-Allow-Methods"] = "GET, POST, OPTIONS"
        respuesta.headers.add("Vary", "Origin")
    return respuesta


# =====================================
# CARGAR PIPELINE ENTRENADO
# =====================================

modelo_pipeline = joblib.load(
    "modelo_bienestar.joblib"
)

# =====================================
# VARIABLES DEL PIPELINE
# =====================================

NOMBRES_VARIABLES = [

    'actividad2',
    'sueno2',
    'estres2',

    'actividad',
    'sueno',
    'estres',

    'actividad_estres',
    'sueno_estres'
]

# =====================================
# HOME
# =====================================

@app.route("/", methods=["GET"])
def home():

    return jsonify({
        "mensaje": "API del modelo de bienestar funcionando correctamente"
    })

# =====================================
# PREDICCION
# =====================================

@app.route("/predict", methods=["POST"])
def predict():

    try:

        data = request.get_json()

        # -----------------------------
        # VALIDACIONES
        # -----------------------------

        if not data:

            return jsonify({
                "error": "No se enviaron datos"
            }), 400

        if (
            "actividad" not in data or
            "sueno" not in data or
            "estres" not in data
        ):

            return jsonify({
                "error":
                "Faltan variables requeridas: actividad, sueno y estres"
            }), 400

        actividad = data["actividad"]
        sueno = data["sueno"]
        estres = data["estres"]

        if not all(

            isinstance(v, (int, float))

            for v in [
                actividad,
                sueno,
                estres
            ]

        ):

            return jsonify({
                "error":
                "actividad, sueno y estres deben ser valores numéricos"
            }), 400

        # -----------------------------
        # DATAFRAME DE ENTRADA
        # -----------------------------

        df_entrada = pd.DataFrame([{

            "actividad": actividad,
            "sueno": sueno,
            "estres": estres

        }])

        # -----------------------------
        # PREDICCION
        # -----------------------------

        prediccion = modelo_pipeline.predict(
            df_entrada
        )[0]

        # -----------------------------
        # COEFICIENTES
        # -----------------------------

        regresion = modelo_pipeline.named_steps[
            'model'
        ]

        escalador = modelo_pipeline.named_steps[
            'scaler'
        ]

        coef_escalados = regresion.coef_

        intercepto_escalado = (
            regresion.intercept_
        )

        medias = escalador.mean_

        desviaciones = escalador.scale_

        # -----------------------------
        # COEFICIENTES ESCALADOS
        # -----------------------------

        pesos_escalados = dict(

            zip(

                NOMBRES_VARIABLES,

                [
                    float(c)
                    for c in coef_escalados
                ]

            )

        )

        # -----------------------------
        # COEFICIENTES REALES
        # -----------------------------

        coef_reales = (
            coef_escalados /
            desviaciones
        )

        intercepto_real = (

            intercepto_escalado

            -

            sum(

                (
                    coef_escalados *
                    medias
                )

                /

                desviaciones

            )

        )

        pesos_reales = dict(

            zip(

                NOMBRES_VARIABLES,

                [
                    float(c)
                    for c in coef_reales
                ]

            )

        )

        # -----------------------------
        # RESPUESTA
        # -----------------------------

        return jsonify({

            "entrada": {

                "actividad":
                actividad,

                "sueno":
                sueno,

                "estres":
                estres

            },

            "bienestar_estimado":
            round(
                float(prediccion),
                2
            ),

            "coeficientes_escalados": {

                "explicacion":

                "Pesos relativos estandarizados para comparar la influencia de cada variable.",

                "intercepto_escalado":
                float(intercepto_escalado),

                "coeficientes":
                pesos_escalados

            },

            "coeficientes_escala_real": {

                "explicacion":

                "Coeficientes expresados en unidades reales.",

                "intercepto_real":
                float(intercepto_real),

                "coeficientes":
                pesos_reales

            }

        })

    except Exception as e:

        return jsonify({

            "error":
            f"Error interno: {str(e)}"

        }), 500

# =====================================
# MAIN
# =====================================

if __name__ == "__main__":

    app.run(

        debug=False,
        host="0.0.0.0",
        port=int(os.environ.get("PORT", "5001"))

    )