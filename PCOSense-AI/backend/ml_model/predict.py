"""
PCOSense AI - Prediction Helper
Loads trained model and returns PCOS risk prediction.
"""

import numpy as np
import joblib
import os

MODELS_DIR = os.path.dirname(os.path.abspath(__file__))
MODEL_PATH = os.path.join(MODELS_DIR, 'pcos_model.pkl')
SCALER_PATH = os.path.join(MODELS_DIR, 'pcos_scaler.pkl')

RISK_LABELS = {0: 'Low', 1: 'Medium', 2: 'High'}

RISK_INFO = {
    'Low': {
        'color': '#22c55e',
        'description': 'Your current profile shows low PCOS indicators. Maintain a healthy lifestyle and regular check-ups.',
        'advice': [
            'Maintain a balanced diet rich in whole grains and vegetables',
            'Exercise regularly (30 min/day)',
            'Track your menstrual cycle monthly',
            'Schedule an annual gynecological exam'
        ]
    },
    'Medium': {
        'color': '#f59e0b',
        'description': 'Some PCOS risk factors are present. Lifestyle changes and monitoring are recommended.',
        'advice': [
            'Consult a gynecologist for evaluation',
            'Reduce processed sugar and refined carbs',
            'Incorporate anti-inflammatory foods (turmeric, berries)',
            'Consider tracking cycle symptoms more carefully',
            'Manage stress with yoga or meditation'
        ]
    },
    'High': {
        'color': '#ef4444',
        'description': 'Multiple PCOS risk factors detected. Medical evaluation is strongly recommended.',
        'advice': [
            'See a gynecologist or endocrinologist soon',
            'Ask about hormonal tests (LH, FSH, androgens, insulin)',
            'Begin a PCOS-friendly low-GI diet immediately',
            'Regular physical activity is crucial — aim for 5x/week',
            'Manage weight under medical supervision if needed',
            'Do NOT self-medicate — get professional guidance'
        ]
    }
}

_model = None
_scaler = None

def _load_artifacts():
    global _model, _scaler
    if _model is None:
        if not os.path.exists(MODEL_PATH):
            raise FileNotFoundError(
                "Model not found. Please run: python ml_model/train_model.py"
            )
        _model = joblib.load(MODEL_PATH)
        _scaler = joblib.load(SCALER_PATH)

def predict_pcos_risk(age, bmi, cycle_length, weight_gain, acne, hair_growth, skin_darkening):
    """
    Returns dict with risk_level, confidence, description, and advice.
    """
    _load_artifacts()

    features = np.array([[
        float(age),
        float(bmi),
        float(cycle_length),
        int(weight_gain),
        int(acne),
        int(hair_growth),
        int(skin_darkening)
    ]])

    features_scaled = _scaler.transform(features)
    prediction = int(_model.predict(features_scaled)[0])
    probabilities = _model.predict_proba(features_scaled)[0]

    risk_level = RISK_LABELS[prediction]
    confidence = round(float(probabilities[prediction]) * 100, 1)
    info = RISK_INFO[risk_level]

    return {
        'risk_level': risk_level,
        'confidence': confidence,
        'probabilities': {
            'Low': round(float(probabilities[0]) * 100, 1),
            'Medium': round(float(probabilities[1]) * 100, 1),
            'High': round(float(probabilities[2]) * 100, 1)
        },
        'color': info['color'],
        'description': info['description'],
        'advice': info['advice']
    }
