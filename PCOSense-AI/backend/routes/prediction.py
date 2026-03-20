from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from models import db, User, Prediction
from ml_model.predict import predict_pcos_risk

prediction_bp = Blueprint('prediction', __name__, url_prefix='/api/prediction')


@prediction_bp.route('/predict', methods=['POST'])
@jwt_required()
def predict():
    user_id = int(get_jwt_identity())
    user = User.query.get_or_404(user_id)
    data = request.get_json()

    required = ['age', 'bmi', 'cycle_length']
    for field in required:
        if data.get(field) is None:
            return jsonify({'error': f'{field} is required'}), 400

    try:
        result = predict_pcos_risk(
            age=data['age'],
            bmi=data['bmi'],
            cycle_length=data['cycle_length'],
            weight_gain=data.get('weight_gain', 0),
            acne=data.get('acne', 0),
            hair_growth=data.get('hair_growth', 0),
            skin_darkening=data.get('skin_darkening', 0)
        )
    except FileNotFoundError as e:
        return jsonify({'error': str(e)}), 503

    # Save to DB
    pred = Prediction(
        user_id=user_id,
        age=data['age'],
        bmi=data['bmi'],
        cycle_length=data['cycle_length'],
        weight_gain=int(data.get('weight_gain', 0)),
        acne=int(data.get('acne', 0)),
        hair_growth=int(data.get('hair_growth', 0)),
        skin_darkening=int(data.get('skin_darkening', 0)),
        risk_level=result['risk_level'],
        confidence=result['confidence']
    )
    db.session.add(pred)
    db.session.commit()

    return jsonify({**result, 'prediction_id': pred.id}), 200


@prediction_bp.route('/history', methods=['GET'])
@jwt_required()
def history():
    user_id = int(get_jwt_identity())
    preds = Prediction.query.filter_by(user_id=user_id)\
                            .order_by(Prediction.predicted_at.desc())\
                            .limit(10).all()
    return jsonify([p.to_dict() for p in preds]), 200


@prediction_bp.route('/latest', methods=['GET'])
@jwt_required()
def latest():
    user_id = int(get_jwt_identity())
    pred = Prediction.query.filter_by(user_id=user_id)\
                           .order_by(Prediction.predicted_at.desc())\
                           .first()
    if not pred:
        return jsonify(None), 200
    return jsonify(pred.to_dict()), 200
