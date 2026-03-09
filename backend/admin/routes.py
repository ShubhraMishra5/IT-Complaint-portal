from flask import Blueprint, request, jsonify
from flask_login import login_required, current_user
from models import ComplaintDetail, ComplaintType, Employee, Engineer
from extensions import db
from datetime import datetime

admin_bp = Blueprint('admin', __name__)


# View all complaints with detailed info
@admin_bp.route('/all-complaints', methods=['GET'])
@login_required
def all_complaints():
    if current_user.role != 'admin':
        return jsonify({'error': 'Access denied'}), 403
    
    status_filter = request.args.get('status')  
    category_filter = request.args.get('category')
    start_date = request.args.get('start_date')  # Format: YYYY-MM-DD
    end_date = request.args.get('end_date')

    query = ComplaintDetail.query

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
        employee = Employee.query.get(c.employee_id)
        engineer = Engineer.query.get(c.engineer_id) if c.engineer_id else None
        c_type = ComplaintType.query.get(c.type_id)

        if category_filter and (not c_type or c_type.category != category_filter):
            continue

        result.append({
            'complaint_id': c.complaint_id,
            'created_at': c.created_at.strftime("%d-%m-%Y, %H:%M"),
            'employee_name': employee.name if employee else None,
            'department': employee.department if employee else None,
            'category': c_type.category if c_type else None,
            'subcategory': c_type.subcategory if c_type else None,
            'engineer_name': engineer.name if engineer else None,
            'status': c.status,
            'assign_task': 'Assign' if not c.engineer_id else 'Assigned',
            'remark': c.admin_remark or 'Add'
        })

    return jsonify(result), 200


# Assign engineer to complaint
@admin_bp.route('/assign', methods=['POST'])
@login_required
def assign_engineer():
    if current_user.role != 'admin':
        return jsonify({'error': 'Access denied'}), 403

    data = request.json
    complaint_id = data.get('complaint_id')
    engineer_id = data.get('engineer_id')

    complaint = ComplaintDetail.query.get(complaint_id)
    engineer = Engineer.query.get(engineer_id)

    if not complaint:
        return jsonify({'error': 'Complaint not found'}), 404
    if not engineer:
        return jsonify({'error': 'Engineer not found'}), 404

    complaint.engineer_id = engineer_id
    complaint.status = 'Assigned'
    db.session.commit()

    return jsonify({'message': 'Engineer assigned to complaint'}), 200


# # Add admin remark
# @admin_bp.route('/add-remark/<int:complaint_id>', methods=['POST'])
# @login_required
# def add_admin_remark(complaint_id):
#     if current_user.role != 'admin':
#         return jsonify({'error': 'Access denied'}), 403

#     data = request.json
#     remark = data.get('remark')

#     complaint = ComplaintDetail.query.get(complaint_id)
#     if not complaint:
#         return jsonify({'error': 'Complaint not found'}), 404

#     complaint.admin_remark = remark
#     db.session.commit()

#     return jsonify({'message': 'Remark added to complaint'}), 200
