from flask import Blueprint, request, jsonify
from flask_login import login_required, current_user
from datetime import datetime
from models import db, ComplaintDetail, ComplaintType, Employee, Engineer
from flask_cors import cross_origin
from sqlalchemy.orm import joinedload
from sqlalchemy import extract, func
import calendar



complaint_bp = Blueprint('complaint', __name__)



# Submit a new complaint
@complaint_bp.route('/submit', methods=['POST','OPTIONS'])
@cross_origin(supports_credentials=True)
@login_required
def submit_complaint():
    if current_user.role != 'employee':
        return jsonify({'error': 'Only employees can submit complaints.'}), 403

    data = request.get_json()

    category = data.get('category')
    subcategory = data.get('subcategory')  # Mapped from complaintType in frontend
    description = data.get('description', '')

    name = current_user.name
    email = current_user.email
    department = current_user.department.dept_name if current_user.department else "Unknown"
    employee_id = current_user.employee_id

    if not category or not subcategory:
        return jsonify({'error': 'Category and Subcategory are required.'}), 400

    # Fetch or validate complaint type
    complaint_type = ComplaintType.query.filter_by(
        category=category, subcategory=subcategory
    ).first()

    if not complaint_type:
        return jsonify({'error': 'Invalid complaint category or subcategory.'}), 400

    # Create complaint
    complaint = ComplaintDetail(
        employee_id=employee_id,
        type_id=complaint_type.type_id,
        description=description,
        name=name,
        email=email,
       
        department_id=current_user.department_id,
        status='Created',
        created_at=datetime.utcnow()
    )

    db.session.add(complaint)
    db.session.commit()

    return jsonify({
        'message': 'Complaint submitted successfully.',
        'complaint_id': complaint.complaint_id,
        'type_id': complaint_type.type_id
    }), 201


# View complaints for logged-in employee
@complaint_bp.route('/my', methods=['GET'])
@login_required
def get_my_complaints():
    if current_user.role != 'employee':
        return jsonify({'error': 'Only employees can view their complaints.'}), 403

    complaints = ComplaintDetail.query.filter_by(employee_id=current_user.employee_id).all()

    result = []
    for c in complaints:
        complaint_type = ComplaintType.query.get(c.type_id)
        result.append({
            'id': c.complaint_id,
            'description': c.description,
            'status': c.status,
            'created_at': c.created_at,
            'engineer_id': c.engineer_id,
            'type_id': c.type_id,
            'employee_remark': c.employee_remark,
            'category': complaint_type.category if complaint_type else None,
            'subcategory': complaint_type.subcategory if complaint_type else None
        })

    return jsonify(result), 200


# View single complaint detail
@complaint_bp.route('/<int:complaint_id>', methods=['GET'])
@login_required
def get_complaint_detail(complaint_id):
    complaint = ComplaintDetail.query.get(complaint_id)

    if not complaint or complaint.employee_id != current_user.employee_id:
        return jsonify({'error': 'Complaint not found or unauthorized.'}), 404

    complaint_type = ComplaintType.query.get(complaint.type_id)

    return jsonify({
        'id': complaint.complaint_id,
        'description': complaint.description,
        'status': complaint.status,
        'name': complaint.name,
        'email': complaint.email,
        'department': complaint.department,
        'created_at': complaint.created_at,
        'started_at': complaint.started_at,
        'completed_at': complaint.completed_at,
        'closed_at': complaint.closed_at,
        'engineer_remark': complaint.engineer_remark,
        'employee_remark': complaint.employee_remark,
        'category': complaint_type.category if complaint_type else None,
        'subcategory': complaint_type.subcategory if complaint_type else None
    }), 200


# Employee verifies and closes a completed complaint
@complaint_bp.route('/<int:complaint_id>/verify', methods=['POST'])
@login_required
def verify_closure(complaint_id):
    if current_user.role != 'employee':
        return jsonify({'error': 'Only employees can verify complaints.'}), 403

    complaint = ComplaintDetail.query.get(complaint_id)

    if not complaint or complaint.employee_id != current_user.employee_id:
        return jsonify({'error': 'Complaint not found or unauthorized.'}), 404

    if complaint.status != 'Completed':
        return jsonify({'error': 'Only completed complaints can be closed.'}), 400

    complaint.status = 'Closed'
    complaint.closed_at = datetime.utcnow()
    complaint.employee_remark = request.json.get('remark', '')
    db.session.commit()

    return jsonify({'message': 'Complaint closed and verified successfully.'}), 200



 
@complaint_bp.route("/types", methods=["GET"])
def get_complaint_types():
    types = ComplaintType.query.all()
    result = {}
    for t in types:
        if t.category not in result:
            result[t.category] = []
        result[t.category].append(t.subcategory)
    return jsonify(result), 200


@complaint_bp.route('/employee-complaints/<employee_id>', methods=['GET'])
def get_complaints_by_employee(employee_id):
    try:
        complaints = ComplaintDetail.query.options(
            joinedload(ComplaintDetail.engineer),  # assuming FK relationship
            joinedload(ComplaintDetail.employee)   # assuming FK relationship
        ).filter_by(employee_id=employee_id).all()

        result = []
        for c in complaints:
            result.append({
                'id': c.complaint_id,
                'title': c.type.subcategory if c.type else None,
                'details': c.description,
                'category': c.type.category if c.type else None,
                'priority': c.type.priority if c.type else None,
                'status': c.status,
                'date': c.created_at.strftime('%Y-%m-%d') if c.created_at else '',
                'startDate': c.started_at.strftime('%Y-%m-%d') if c.started_at else '',
                'endDate': c.completed_at.strftime('%Y-%m-%d') if c.completed_at else '',
                'engineer': c.engineer.name if c.engineer else '',
                'department': c.department.department_id if c.department else ''
            })

        return jsonify(result), 200

    except Exception as e:
        import traceback
        print("An error occurred in employee-complaints route:")
        traceback.print_exc()  
        return jsonify({'error': str(e)}), 500
    
