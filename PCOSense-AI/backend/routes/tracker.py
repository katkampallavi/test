import json
from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from models import db, HealthRecord

tracker_bp = Blueprint('tracker', __name__, url_prefix='/api/tracker')


@tracker_bp.route('/log', methods=['POST'])
@jwt_required()
def log_cycle():
    user_id = int(get_jwt_identity())
    data = request.get_json()

    symptoms = data.get('symptoms', [])
    if isinstance(symptoms, list):
        symptoms = json.dumps(symptoms)

    record = HealthRecord(
        user_id=user_id,
        period_start_date=data.get('period_start_date'),
        cycle_length=data.get('cycle_length'),
        period_duration=data.get('period_duration'),
        symptoms=symptoms,
        mood=data.get('mood'),
        weight_on_date=data.get('weight_on_date'),
        notes=data.get('notes', '')
    )
    db.session.add(record)
    db.session.commit()
    return jsonify(record.to_dict()), 201


@tracker_bp.route('/records', methods=['GET'])
@jwt_required()
def get_records():
    user_id = int(get_jwt_identity())
    records = HealthRecord.query.filter_by(user_id=user_id)\
                                .order_by(HealthRecord.logged_at.desc())\
                                .all()
    return jsonify([r.to_dict() for r in records]), 200


@tracker_bp.route('/records/<int:record_id>', methods=['DELETE'])
@jwt_required()
def delete_record(record_id):
    user_id = int(get_jwt_identity())
    record = HealthRecord.query.filter_by(id=record_id, user_id=user_id).first_or_404()
    db.session.delete(record)
    db.session.commit()
    return jsonify({'message': 'Record deleted'}), 200


@tracker_bp.route('/stats', methods=['GET'])
@jwt_required()
def cycle_stats():
    user_id = int(get_jwt_identity())
    records = HealthRecord.query.filter_by(user_id=user_id)\
                                .order_by(HealthRecord.logged_at.asc())\
                                .all()

    if not records:
        return jsonify({'avg_cycle': None, 'total_cycles': 0, 'irregular': False}), 200

    cycles = [r.cycle_length for r in records if r.cycle_length]
    weights = [
        {'date': r.period_start_date or r.logged_at.strftime('%Y-%m-%d'),
         'weight': r.weight_on_date}
        for r in records if r.weight_on_date
    ]

    avg = round(sum(cycles) / len(cycles), 1) if cycles else None
    irregular = any(c < 21 or c > 35 for c in cycles)

    return jsonify({
        'avg_cycle': avg,
        'total_cycles': len(cycles),
        'irregular': irregular,
        'cycle_lengths': cycles,
        'weight_history': weights
    }), 200
