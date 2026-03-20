"""
PCOSense AI - Backend Server
Flask REST API with SQLite database and ML integration.

Run:
    python app.py
"""

import os
import sys

# Add backend directory to path for imports
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from flask import Flask, jsonify
from flask_cors import CORS
from flask_jwt_extended import JWTManager
from config import Config
from models import db

def create_app():
    app = Flask(__name__)
    app.config.from_object(Config)

    # Extensions
    CORS(app, origins=app.config['CORS_ORIGINS'], supports_credentials=True)
    JWTManager(app)
    db.init_app(app)

    # Register blueprints
    from routes.auth import auth_bp
    from routes.prediction import prediction_bp
    from routes.tracker import tracker_bp
    from routes.recommendations import reco_bp
    from routes.chatbot import chatbot_bp

    app.register_blueprint(auth_bp)
    app.register_blueprint(prediction_bp)
    app.register_blueprint(tracker_bp)
    app.register_blueprint(reco_bp)
    app.register_blueprint(chatbot_bp)

    # Health check
    @app.route('/api/health')
    def health():
        return jsonify({'status': 'ok', 'app': 'PCOSense AI', 'version': '1.0.0'})

    # Create tables
    with app.app_context():
        pass  # db file created in backend folder
        db.create_all()
        print("✅ Database tables created")

    return app


if __name__ == '__main__':
    app = create_app()
    print("\n🌸 PCOSense AI Backend running at http://localhost:5000\n")
    app.run(debug=True, host='0.0.0.0', port=5000)
