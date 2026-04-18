from pathlib import Path
import os

from flask import Flask, jsonify, request
import joblib

app = Flask(__name__)

AI_DIR = Path(__file__).resolve().parent
MODEL_PATH = AI_DIR / "complaint_classifier.pkl"

VALID_CATEGORIES = {
    "Electrical",
    "Plumbing",
    "Housekeeping",
    "Internet",
    "Mess",
    "Furniture",
    "Other",
}

# Load model once at startup.
try:
    MODEL = joblib.load(MODEL_PATH)
except Exception:
    MODEL = None


@app.post("/predict")
def predict_category():
    try:
        payload = request.get_json(silent=True) or {}
        text = str(payload.get("text", "")).strip()

        if not text:
            return jsonify({"category": "Other"}), 200

        if MODEL is None:
            return jsonify({"category": "Other"}), 200

        prediction = MODEL.predict([text])
        category = str(prediction[0]) if len(prediction) > 0 else "Other"

        if category not in VALID_CATEGORIES:
            category = "Other"

        return jsonify({"category": category}), 200
    except Exception:
        return jsonify({"category": "Other"}), 200


if __name__ == "__main__":
    app.run(host="0.0.0.0", port=int(os.getenv("AI_PORT", "8000")))
