from flask import Blueprint, jsonify
from flask_login import login_required, current_user
from sqlalchemy import func
from models import ComplaintDetail, Department, Employee, ComplaintType
from extensions import db

management_bp = Blueprint('management', __name__)


# General complaint summary
@management_bp.route('/summary', methods=['GET'])
@login_required
def complaint_summary():
    if current_user.role != 'management':
        return jsonify({'error': 'Access denied'}), 403

    total = db.session.query(func.count(ComplaintDetail.complaint_id)).scalar()
    completed = db.session.query(func.count()).filter(ComplaintDetail.status == 'Completed').scalar()
    closed = db.session.query(func.count()).filter(ComplaintDetail.status == 'Closed').scalar()
    open_cases = total - completed - closed

    return jsonify({
        'total_complaints': total,
        'open_complaints': open_cases,
        'completed': completed,
        'closed': closed
    }), 200


# Department performance: total & resolved complaints
@management_bp.route('/department-performance', methods=['GET'])
@login_required
def department_performance():
    if current_user.role != 'management':
        return jsonify({'error': 'Access denied'}), 403

    results = db.session.query(
        Department.dept_name,
        func.count(ComplaintDetail.complaint_id).label('total'),
        func.count(func.filter(ComplaintDetail.status == 'Closed')).label('closed')
    ).join(Employee, Employee.department_id == Department.department_id) \
     .join(ComplaintDetail, ComplaintDetail.employee_id == Employee.employee_id) \
     .group_by(Department.dept_name).all()

    data = [{'department': r[0], 'total': r[1], 'closed': r[2]} for r in results]

    return jsonify(data), 200


# Complaints grouped by category
@management_bp.route('/complaints-by-category', methods=['GET'])
@login_required
def complaints_by_category():
    if current_user.role != 'management':
        return jsonify({'error': 'Access denied'}), 403

    results = db.session.query(
        ComplaintType.category,
        func.count(ComplaintDetail.complaint_id)
    ).join(ComplaintDetail, ComplaintDetail.type_id == ComplaintType.type_id) \
     .group_by(ComplaintType.category).all()

    data = [{'category': r[0], 'count': r[1]} for r in results]

    return jsonify(data), 200
