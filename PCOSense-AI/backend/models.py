from flask_sqlalchemy import SQLAlchemy
from werkzeug.security import generate_password_hash, check_password_hash
from datetime import datetime

db = SQLAlchemy()

class User(db.Model):
    __tablename__ = 'users'
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), nullable=False)
    email = db.Column(db.String(120), unique=True, nullable=False)
    password_hash = db.Column(db.String(255), nullable=False)
    age = db.Column(db.Integer, nullable=True)
    weight = db.Column(db.Float, nullable=True)   # kg
    height = db.Column(db.Float, nullable=True)   # cm
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    health_records = db.relationship('HealthRecord', backref='user', lazy=True, cascade='all, delete-orphan')
    predictions = db.relationship('Prediction', backref='user', lazy=True, cascade='all, delete-orphan')

    def set_password(self, password):
        self.password_hash = generate_password_hash(password)

    def check_password(self, password):
        return check_password_hash(self.password_hash, password)

    @property
    def bmi(self):
        if self.weight and self.height and self.height > 0:
            return round(self.weight / ((self.height / 100) ** 2), 1)
        return None

    def to_dict(self):
        return {
            'id': self.id,
            'name': self.name,
            'email': self.email,
            'age': self.age,
            'weight': self.weight,
            'height': self.height,
            'bmi': self.bmi,
            'created_at': self.created_at.isoformat()
        }


class HealthRecord(db.Model):
    __tablename__ = 'health_records'
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    period_start_date = db.Column(db.String(20), nullable=True)
    cycle_length = db.Column(db.Integer, nullable=True)   # days
    period_duration = db.Column(db.Integer, nullable=True)  # days
    symptoms = db.Column(db.Text, nullable=True)           # JSON string
    mood = db.Column(db.String(50), nullable=True)
    weight_on_date = db.Column(db.Float, nullable=True)
    notes = db.Column(db.Text, nullable=True)
    logged_at = db.Column(db.DateTime, default=datetime.utcnow)

    def to_dict(self):
        import json
        return {
            'id': self.id,
            'user_id': self.user_id,
            'period_start_date': self.period_start_date,
            'cycle_length': self.cycle_length,
            'period_duration': self.period_duration,
            'symptoms': json.loads(self.symptoms) if self.symptoms else [],
            'mood': self.mood,
            'weight_on_date': self.weight_on_date,
            'notes': self.notes,
            'logged_at': self.logged_at.isoformat()
        }


class Prediction(db.Model):
    __tablename__ = 'predictions'
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    age = db.Column(db.Integer)
    bmi = db.Column(db.Float)
    cycle_length = db.Column(db.Integer)
    weight_gain = db.Column(db.Integer)   # 0 or 1
    acne = db.Column(db.Integer)          # 0 or 1
    hair_growth = db.Column(db.Integer)   # 0 or 1
    skin_darkening = db.Column(db.Integer) # 0 or 1
    risk_level = db.Column(db.String(20))  # High / Medium / Low
    confidence = db.Column(db.Float)
    predicted_at = db.Column(db.DateTime, default=datetime.utcnow)

    def to_dict(self):
        return {
            'id': self.id,
            'user_id': self.user_id,
            'age': self.age,
            'bmi': self.bmi,
            'cycle_length': self.cycle_length,
            'weight_gain': bool(self.weight_gain),
            'acne': bool(self.acne),
            'hair_growth': bool(self.hair_growth),
            'skin_darkening': bool(self.skin_darkening),
            'risk_level': self.risk_level,
            'confidence': self.confidence,
            'predicted_at': self.predicted_at.isoformat()
        }
