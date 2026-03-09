from flask import Blueprint, request, jsonify
from flask_login import login_required, current_user
from datetime import datetime
from models import ComplaintDetail
from extensions import db

engineer_bp = Blueprint('engineer', __name__)


# View assigned complaints
@engineer_bp.route('/assigned', methods=['GET'])
@login_required
def get_assigned_complaints():
    if current_user.role != 'engineer':
        return jsonify({'error': 'Access denied'}), 403
    
    status_filter = request.args.get('status')
    start_date = request.args.get('start_date')  # format: YYYY-MM-DD
    end_date = request.args.get('end_date')  

    query = ComplaintDetail.query.filter_by(engineer_id=current_user.employee_id)

    if status_filter:
        query = query.filter(ComplaintDetail.status == status_filter)

    if start_date:
        try:
            start_dt = datetime.strptime(start_date, "%Y-%m-%d")
            query = query.filter(ComplaintDetail.created_at >= start_dt)
        except ValueError:
            return jsonify({'error': 'Invalid start_date format. Use YYYY-MM-DD'}), 400

    if end_date:
        try:
            end_dt = datetime.strptime(end_date, "%Y-%m-%d")
            query = query.filter(ComplaintDetail.created_at <= end_dt)
        except ValueError:
            return jsonify({'error': 'Invalid end_date format. Use YYYY-MM-DD'}), 400


    complaints = query.all()
    result = []
    for c in complaints:
        result.append({
            'complaint_id': c.complaint_id,
            'description': c.description,
            'status': c.status,
            'created_at': c.created_at,
            'started_at': c.started_at,
            'completed_at': c.completed_at,
            'employee_remark': c.employee_remark
        })

    return jsonify(result), 200


# Start a complaint (mark as "In Progress")
@engineer_bp.route('/start/<int:complaint_id>', methods=['POST'])
@login_required
def start_complaint(complaint_id):
    if current_user.role != 'engineer':
        return jsonify({'error': 'Access denied'}), 403

    complaint = ComplaintDetail.query.get(complaint_id)

    if not complaint or complaint.engineer_id != current_user.employee_id:
        return jsonify({'error': 'Complaint not found or not assigned to you.'}), 404

    complaint.status = 'In Progress'
    complaint.started_at = datetime.utcnow()
    db.session.commit()

    return jsonify({'message': 'Complaint marked as In Progress'}), 200


# Complete a complaint (mark as "Completed")
@engineer_bp.route('/complete/<int:complaint_id>', methods=['POST'])
@login_required
def complete_complaint(complaint_id):
    if current_user.role != 'engineer':
        return jsonify({'error': 'Access denied'}), 403

    data = request.json
    engineer_remark = data.get('remark', '')

    complaint = ComplaintDetail.query.get(complaint_id)

    if not complaint or complaint.engineer_id != current_user.employee_id:
        return jsonify({'error': 'Complaint not found or not assigned to you.'}), 404

    if complaint.status != 'In Progress':
        return jsonify({'error': 'Only in-progress complaints can be completed'}), 400

    complaint.status = 'Completed'
    complaint.completed_at = datetime.utcnow()
    complaint.engineer_remark = engineer_remark
    db.session.commit()

    return jsonify({'message': 'Complaint marked as Completed'}), 200
