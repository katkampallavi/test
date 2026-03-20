"""
PCOSense AI - Machine Learning Model Training
Trains a Random Forest classifier to predict PCOS risk.
Run this script once before starting the backend server.

Usage:
    cd backend
    python ml_model/train_model.py
"""

import numpy as np
import pandas as pd
from sklearn.ensemble import RandomForestClassifier
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import StandardScaler
from sklearn.metrics import classification_report, accuracy_score
import joblib
import os

MODELS_DIR = os.path.dirname(os.path.abspath(__file__))

def generate_synthetic_dataset(n_samples=2000, random_state=42):
    """
    Generate synthetic PCOS dataset based on real-world medical correlations.
    Features: age, bmi, cycle_length, weight_gain, acne, hair_growth, skin_darkening
    Labels: 0=Low Risk, 1=Medium Risk, 2=High Risk
    """
    np.random.seed(random_state)

    # Base features
    age = np.random.randint(15, 50, n_samples)
    bmi = np.random.normal(25, 6, n_samples).clip(14, 50)
    cycle_length = np.random.randint(21, 60, n_samples)
    weight_gain = np.random.binomial(1, 0.4, n_samples)
    acne = np.random.binomial(1, 0.45, n_samples)
    hair_growth = np.random.binomial(1, 0.35, n_samples)
    skin_darkening = np.random.binomial(1, 0.3, n_samples)

    # Risk score — medically informed logic
    risk_score = np.zeros(n_samples)

    # BMI contribution
    risk_score += np.where(bmi >= 30, 3, np.where(bmi >= 25, 1.5, 0))

    # Irregular cycles (< 21 or > 35 days)
    risk_score += np.where((cycle_length < 21) | (cycle_length > 35), 2.5, 0)

    # Symptomatic features
    risk_score += weight_gain * 2.0
    risk_score += acne * 1.5
    risk_score += hair_growth * 2.0
    risk_score += skin_darkening * 1.5

    # Age: highest risk in reproductive prime
    risk_score += np.where((age >= 18) & (age <= 35), 0.5, 0)

    # Add noise
    risk_score += np.random.normal(0, 0.8, n_samples)

    # Classify: Low=0, Medium=1, High=2
    labels = np.select(
        [risk_score < 4, risk_score < 7],
        [0, 1],
        default=2
    )

    df = pd.DataFrame({
        'age': age,
        'bmi': bmi.round(1),
        'cycle_length': cycle_length,
        'weight_gain': weight_gain,
        'acne': acne,
        'hair_growth': hair_growth,
        'skin_darkening': skin_darkening,
        'risk': labels
    })

    return df


def train_and_save():
    print("=" * 50)
    print("  PCOSense AI — Model Training")
    print("=" * 50)

    # 1. Generate data
    print("\n[1/4] Generating synthetic training dataset...")
    df = generate_synthetic_dataset(n_samples=3000)
    print(f"      Dataset shape: {df.shape}")
    print(f"      Class distribution:\n{df['risk'].value_counts().rename({0:'Low',1:'Medium',2:'High'})}")

    # 2. Prepare features
    print("\n[2/4] Preparing features and splitting data...")
    X = df[['age','bmi','cycle_length','weight_gain','acne','hair_growth','skin_darkening']]
    y = df['risk']

    X_train, X_test, y_train, y_test = train_test_split(
        X, y, test_size=0.2, random_state=42, stratify=y
    )

    scaler = StandardScaler()
    X_train_scaled = scaler.fit_transform(X_train)
    X_test_scaled = scaler.transform(X_test)

    # 3. Train model
    print("\n[3/4] Training Random Forest Classifier...")
    model = RandomForestClassifier(
        n_estimators=200,
        max_depth=10,
        min_samples_split=5,
        min_samples_leaf=2,
        class_weight='balanced',
        random_state=42,
        n_jobs=-1
    )
    model.fit(X_train_scaled, y_train)

    y_pred = model.predict(X_test_scaled)
    accuracy = accuracy_score(y_test, y_pred)
    print(f"\n      Test Accuracy: {accuracy:.2%}")
    print("\n      Classification Report:")
    print(classification_report(
        y_test, y_pred,
        target_names=['Low Risk','Medium Risk','High Risk']
    ))

    # Feature importance
    print("      Feature Importances:")
    feat_names = X.columns.tolist()
    importances = model.feature_importances_
    for name, imp in sorted(zip(feat_names, importances), key=lambda x: -x[1]):
        print(f"        {name:<20}: {imp:.3f}")

    # 4. Save model and scaler
    print("\n[4/4] Saving model and scaler...")
    model_path = os.path.join(MODELS_DIR, 'pcos_model.pkl')
    scaler_path = os.path.join(MODELS_DIR, 'pcos_scaler.pkl')

    joblib.dump(model, model_path)
    joblib.dump(scaler, scaler_path)

    print(f"      Model saved  → {model_path}")
    print(f"      Scaler saved → {scaler_path}")
    print("\n✅  Training complete! You can now start the backend server.\n")


if __name__ == '__main__':
    train_and_save()
