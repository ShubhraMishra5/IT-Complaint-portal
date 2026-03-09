from flask import Blueprint, jsonify, request, current_app
from flask_login import login_required, current_user
from models import Department, db, ComplaintDetail, ComplaintType, Employee, Engineer
from extensions import db
from collections import defaultdict
from datetime import datetime
from sqlalchemy import extract, func
import calendar
from sqlalchemy.orm import aliased
from werkzeug.security import generate_password_hash
from flask_cors import CORS, cross_origin
import sys


dashboard_bp = Blueprint('dashboard', __name__, url_prefix='/dashboard')


def status_count(complaints):
    return {
        'Total': len(complaints),
        'Pending': sum(c.status == 'Pending' for c in complaints),
        'In Progress': sum(c.status == 'In Progress' for c in complaints),
        'Completed': sum(c.status == 'Completed' for c in complaints),
        'Closed': sum(c.status == 'Closed' for c in complaints),
    }


def monthly_category_distribution(complaints):
    data = defaultdict(lambda: defaultdict(int))
    for c in complaints:
        if c.created_at and c.category:
            month = c.created_at.strftime('%b').upper()  # e.g. JAN, FEB
            data[month][c.category] += 1
    return data


def department_status_breakdown(complaints):
    grouped_by_dept = defaultdict(list)
    for c in complaints:
        grouped_by_dept[c.department].append(c)

    return {
        dept: status_count(dept_complaints)
        for dept, dept_complaints in grouped_by_dept.items()
    }


@dashboard_bp.route('/employee', methods=['GET'])
@login_required
def employee_dashboard():
    if current_user.role != 'employee':
        return jsonify({'error': 'Access denied'}), 403

    personal_complaints = ComplaintDetail.query.filter_by(
        employee_id=current_user.employee_id).all()

    department_complaints = ComplaintDetail.query.filter_by(
        department=current_user.department).all()

    return jsonify({
        'personal': status_count(personal_complaints),
        'department': status_count(department_complaints),
        'monthly_category': monthly_category_distribution(department_complaints)
    }), 200


@dashboard_bp.route('/common', methods=['GET'])
@login_required
def common_dashboard():
    if current_user.role not in ['admin', 'engineer', 'management']:
        return jsonify({'error': 'Access denied'}), 403

    complaints = ComplaintDetail.query.all()

    return jsonify({
        'overall': status_count(complaints),
        'monthly_category': monthly_category_distribution(complaints),
        'department_breakdown': department_status_breakdown(complaints)
    }), 200


#bar graph
@dashboard_bp.route('/monthly', methods=['GET'])
@login_required
def get_monthly_complaints():
    department_name = request.args.get('department')  # department as string

     # Build query
    query = db.session.query(
        extract('month', ComplaintDetail.created_at).label('month'),
        func.count(ComplaintDetail.complaint_id).label('count')
    )

    # Fallback to user's department
    if not department_name and hasattr(current_user, 'department') and current_user.department:
        query = query.filter(ComplaintDetail.department == current_user.department)
        department_name = current_user.department

   

    if department_name:
        query = query.filter(ComplaintDetail.department == department_name)

    query = query.group_by('month').order_by('month')

    results = query.all()

    monthly_data = [
        {"month": calendar.month_abbr[int(month)], "count": count}
        for month, count in results
    ]

    return jsonify(monthly_data)

#pie chart
@dashboard_bp.route('/department-wise', methods=['GET'])
@login_required
def get_department_wise_complaints():
    department_only = request.args.get('departmentOnly', '').lower() == 'true'
    
    query = db.session.query(
        Department.dept_name.label("department"),
        func.count(ComplaintDetail.complaint_id).label("count")
    ).outerjoin(
        Employee, Employee.department_id == Department.department_id
    ).outerjoin(
        ComplaintDetail, ComplaintDetail.employee_id == Employee.employee_id
    )

    if department_only and hasattr(current_user, 'department'):
        query = query.filter(Department.dept_name == current_user.department.dept_name)

    query = query.group_by(Department.dept_name).order_by(Department.dept_name)

    results = query.all()

    data = [{"department": dept if dept else "Unknown", "count": count} for dept, count in results]
    return jsonify(data)

@dashboard_bp.route('/status', methods=['GET'])
@login_required
def get_complaint_status_counts():
    department_only = request.args.get('departmentOnly', '').lower() == 'true'

    query = db.session.query(
        ComplaintDetail.status,
        func.count(ComplaintDetail.complaint_id)
    )

    if department_only and hasattr(current_user, 'department'):
        query = query.filter(ComplaintDetail.department == current_user.department)

    query = query.group_by(ComplaintDetail.status).order_by(ComplaintDetail.status)

    results = query.all()

    status_data = [{"status": status if status else "Unknown", "count": count} for status, count in results]
    return jsonify(status_data)

@dashboard_bp.route('/complaint-records', methods=['GET'])
@login_required
def get_complaint_records():
    
    query = ComplaintDetail.query.join(Employee).outerjoin(Engineer)

    # Restrict for employees to only their department
    if current_user.role == 'employee':
        if current_user.department_id:
            query = query.filter(ComplaintDetail.department_id == current_user.department_id)
        else:
            return jsonify([])  

    complaints = query.all()
    records = []

    for c in complaints:
        records.append({
            "id": f"C{c.complaint_id:03}",
            "title": c.description or '',
            "complaintType": c.type.category if c.type else '',
            "category": c.type.subcategory if c.type else '',
            "department": c.department.dept_name if c.department else '',
            "submittedBy": c.employee.name if c.employee else '',
            "status": c.status or 'Unknown',
            "priority": c.type.priority if c.type and c.type.priority is not None else 1,
            "date": c.created_at.strftime('%Y-%m-%d') if c.created_at else '',
            "startDate": c.started_at.strftime('%Y-%m-%d') if c.started_at else '',
            "endDate": c.completed_at.strftime('%Y-%m-%d') if c.completed_at else '',
            "engineer": c.engineer.name if c.engineer else '',
            "adminRemark": c.admin_remark or ''
        })

    return jsonify(records)

#Admin view complaint
@dashboard_bp.route('/Admin-view-complaint', methods=['GET'])
@login_required
def Admin_view_complaint():
    complaints = ComplaintDetail.query.join(Employee).outerjoin(Engineer).outerjoin(ComplaintType).outerjoin(Department, ComplaintDetail.department_id == Department.department_id).all()
    records = []

    for c in complaints:
        records.append({
            "id": c.complaint_id,
            "title": c.description or '',
            "complaintType": c.type.subcategory if c.type else '',
            "category": c.type.category if c.type else '',
            "department": c.department.dept_name if c.department else '',
            "submittedBy": c.employee.name if c.employee else '',
            "status": c.status,
            "priority": c.type.priority if c.type else 1,
            "date": c.created_at.strftime('%Y-%m-%d') if c.created_at else '',
            "startDate": c.started_at.strftime('%Y-%m-%d') if c.started_at else '',
            "endDate": c.completed_at.strftime('%Y-%m-%d') if c.completed_at else '',
            "engineer": c.engineer.name if c.engineer else '',
            "isAssigned": bool(c.engineer_id),
            "adminRemark": c.admin_remark or ''
        })

    return jsonify(records)

#Admin assign complaint
@dashboard_bp.route('/complaint/<int:complaint_id>', methods=['GET'])
@login_required
def get_complaint_by_id(complaint_id):
    complaint = ComplaintDetail.query \
        .join(Employee, ComplaintDetail.employee_id == Employee.employee_id) \
        .join(ComplaintType, ComplaintDetail.type_id == ComplaintType.type_id) \
        .outerjoin(Department, ComplaintDetail.department_id == Department.department_id) \
        .filter(ComplaintDetail.complaint_id == complaint_id) \
        .first()

    if not complaint:
        return jsonify({'error': 'Complaint not found'}), 404

    return jsonify({
        "id": complaint.complaint_id,
        "createdAt": complaint.created_at.strftime('%Y-%m-%d') if complaint.created_at else '',
        "submittedBy": complaint.employee.name,
        "email": complaint.employee.email,
        "department": complaint.department.dept_name if complaint.department else '',
        "category": complaint.type.category,
        "complaintType": complaint.type.subcategory,
        "priority": complaint.type.priority,
        "title": complaint.description,
        "description": complaint.description
    })

# Get all engineers
@dashboard_bp.route('/engineers', methods=['GET'])
@login_required
def get_engineers():
    engineers = Engineer.query.all()
    data = [
        {
            "id": e.engineer_id,
            "name": e.name,
            "expertise": e.expertise,
            "contact": e.contact  
        } for e in engineers
    ]
    return jsonify(data)

# Assign a complaint
@dashboard_bp.route('/assign-complaint/<int:complaint_id>', methods=['POST'])
@login_required
def assign_complaint(complaint_id):
    data = request.get_json()
    priority = data.get('priority')
    engineer_id = data.get('engineer_id')

    complaint = db.session.get(ComplaintDetail, complaint_id)
    engineer = db.session.get(Engineer, engineer_id)

    if not complaint or not engineer:
        return jsonify({'error': 'Invalid complaint or engineer'}), 404

    complaint.priority = priority
    complaint.engineer_id = engineer_id
    complaint.started_at = datetime.utcnow()
    db.session.commit()

    return jsonify({'message': 'Complaint assigned successfully'}), 200



#admin manage table
# EMPLOYEE ROUTES
@dashboard_bp.route('/employees', methods=['GET', 'POST', 'OPTIONS'])
def employees_route():
    if request.method == 'OPTIONS':
        return '', 204
    elif request.method == 'GET':
        employees = Employee.query.all()
        return jsonify([
            {
                "employee_id": e.employee_id,
                "name": e.name,
                "email": e.email,
                "department_id": e.department_id,
                "role": e.role
            } for e in employees
        ])
    elif request.method == 'POST':
        data = request.get_json()
        if not data.get("employee_id"):
            return jsonify({"error": "Employee ID is required"}), 400

        # Check for duplicate ID
        if Employee.query.get(data["employee_id"]):
            return jsonify({"error": "Employee ID already exists"}), 400
        
        existing = Employee.query.filter_by(email=data['email']).first()
        if existing:
           return jsonify({"error": "Email already exists"}), 400
        
        employee = Employee(
            employee_id=data['employee_id'],
            name=data['name'],
            email=data['email'],
            department_id=data['department_id'],
            role=data['role'],
            password=generate_password_hash(data['password'])
        )
        db.session.add(employee)
        db.session.commit()
        return jsonify({
            "id": employee.employee_id,
            "name": employee.name,
            "email": employee.email,
            "department_id": employee.department_id,
            "role": employee.role
        }), 201
    
@dashboard_bp.route('/employees/<int:employee_id>', methods=['DELETE', 'OPTIONS'])
def delete_employee(employee_id):
    if request.method == 'OPTIONS':
        return '', 204

    employee = Employee.query.get(employee_id)
    if not employee:
        return jsonify({'error': 'Employee not found'}), 404

    db.session.delete(employee)
    db.session.commit()
    return jsonify({'message': 'Employee deleted successfully'}), 200


# ENGINEER ROUTES
@dashboard_bp.route('/manage-engineers', methods=['GET', 'POST', 'OPTIONS'])
@cross_origin()
def handle_engineers():
    if request.method == 'OPTIONS':
        return '', 204

    if request.method == 'GET':
        engineers = Engineer.query.all()
        print("ENGINEERS FROM DB:", [e.__dict__ for e in engineers], file=sys.stderr)
        return jsonify([
            {
                "engineer_id": e.engineer_id or e.id,
                "name": e.name,
                "contact": e.contact,
                "specialization": e.expertise
            } for e in engineers
        ])

    elif request.method == 'POST':
        data = request.get_json()

        required_fields = ["engineer_id", "name", "contact", "specialization", "password"]
        if not all(k in data for k in required_fields):
            return jsonify({"error": "Missing fields"}), 400

        if Engineer.query.get(data['engineer_id']):
            return jsonify({"error": "Engineer ID already exists"}), 400

        hashed_password = generate_password_hash(data['password'])

        engineer = Engineer(
            engineer_id=data['engineer_id'],
            name=data['name'],
            contact=data['contact'],
            expertise=data['specialization'],
            password=hashed_password
        )
        db.session.add(engineer)
        db.session.commit()

        return jsonify({
            "engineer_id": engineer.engineer_id,
            "name": engineer.name,
            "contact": engineer.contact,
            "specialization": engineer.expertise
        }), 201

@dashboard_bp.route('/manage-engineers/<int:id>', methods=['DELETE', 'OPTIONS'])
@cross_origin()
def delete_engineer(id):
    if request.method == 'OPTIONS':
        return '', 204

    engineer = Engineer.query.get_or_404(id)
    db.session.delete(engineer)
    db.session.commit()
    return jsonify({"message": "Engineer deleted"})

#engineer assigned complaints/tending
@dashboard_bp.route('/complaints/<int:complaint_id>', methods=['PATCH','OPTIONS'])
@login_required
def update_complaint_status(complaint_id):
    if request.method == 'OPTIONS':
        return '', 200
    complaint = ComplaintDetail.query.get_or_404(complaint_id)

    if current_user.role != 'engineer':
        return jsonify({'error': 'Only engineers can update complaints'}), 403
    if complaint.engineer_id != current_user.engineer_id:
        return jsonify({'error': 'You are not assigned to this complaint'}), 403

    data = request.get_json()
    status = data.get('status')
    remark = data.get('engineerRemark')
    start_date = data.get('startDate')
    end_date = data.get('endDate')

    if status:
        complaint.status = status
    if remark is not None:
        complaint.engineer_remark = remark
    if start_date:
        try:
                complaint.started_at = datetime.strptime(start_date, '%Y-%m-%d')
        except ValueError as e:
                return jsonify({'error': f'Invalid start date format: {e}'}), 400
        
    if end_date:
        try:
                complaint.completed_at = datetime.strptime(end_date, '%Y-%m-%d')
        except ValueError as e:
                return jsonify({'error': f'Invalid end date format: {e}'}), 400
        

    db.session.commit()
    return jsonify({'message': 'Complaint updated successfully'}), 200

   

#engineer complaint table

@dashboard_bp.route('/engineer-complaints', methods=['GET'])
@login_required
def get_engineer_complaints():
    if current_user.role != 'engineer':
        return jsonify({'error': 'Access denied'}), 403

    complaints = ComplaintDetail.query \
        .filter(ComplaintDetail.engineer_id == current_user.engineer_id) \
        .join(Employee) \
        .join(Department, ComplaintDetail.department_id == Department.department_id) \
        .join(ComplaintType, ComplaintDetail.type_id == ComplaintType.type_id) \
        .all()

    data = []
    for c in complaints:
        data.append({
            "id": f"C{c.complaint_id:03}",
            "createdAt": c.created_at.strftime('%Y-%m-%d') if c.created_at else '',
            "startDate": c.started_at.strftime('%Y-%m-%d') if c.started_at else '',
            "endDate": c.completed_at.strftime('%Y-%m-%d') if c.completed_at else '',
            "submittedBy": c.employee.name if c.employee else '',
            "department": c.department.dept_name if c.department else '',
            "category": c.type.category if c.type else '',
            "complaintType": c.type.subcategory if c.type else '',
            "status": c.status,
            "priority": c.type.priority if c.type and c.type.priority is not None else 1
        })

    return jsonify(data), 200

#admin reolved remarks
@dashboard_bp.route('/complaints/<int:complaint_id>/admin-remark', methods=['PATCH'])
@login_required
def update_admin_remark(complaint_id):
    if current_user.role != 'admin':
        return jsonify({'error': 'Only admins can update admin remarks'}), 403

    complaint = ComplaintDetail.query.get_or_404(complaint_id)
    data = request.get_json()

    admin_remark = data.get('adminRemark')
    if admin_remark is None:
        return jsonify({'error': 'adminRemark field is required'}), 400

    complaint.admin_remark = admin_remark
    db.session.commit()

    return jsonify({'message': 'Admin remark added successfully'}), 200

#complaint detail page
@dashboard_bp.route('/complaints/<int:complaint_id>', methods=['GET'])
@login_required
def get_complaint_details(complaint_id):
    complaint = ComplaintDetail.query.get_or_404(complaint_id)

    return jsonify({
        "id": f"C{complaint.complaint_id:03}",
        "employeeId": complaint.employee.employee_id if complaint.employee else '',
        "name": complaint.employee.name if complaint.employee else '',
        "email": complaint.employee.email if complaint.employee else '',
        "category": complaint.type.category if complaint.type else '',
        "complaintType": complaint.type.subcategory if complaint.type else '',
        "date": complaint.created_at.strftime('%Y-%m-%d') if complaint.created_at else '',
        "title": complaint.description or '',
        "description": complaint.description or '',
        "priority": complaint.type.priority if complaint.type else '',
        "expertise": complaint.engineer.expertise if complaint.engineer else '',
        "engineer": complaint.engineer.name if complaint.engineer else '',
        "engineerContact": complaint.engineer.contact if complaint.engineer and complaint.engineer.contact else '',
        "startDate": complaint.started_at.strftime('%Y-%m-%d') if complaint.started_at else '',
        "endDate": complaint.completed_at.strftime('%Y-%m-%d') if complaint.completed_at else '',
        "status": complaint.status or '',
        "engineerRemark": complaint.engineer_remark or '',
        "adminRemark": complaint.admin_remark or '',
        "employeeVerificationRemark": complaint.employee_remark or '',
    }), 200

# employee verification
@dashboard_bp.route('/complaints/<int:complaint_id>/verify', methods=['PATCH'])
@cross_origin(supports_credentials=True)
@login_required
def verify_complaint(complaint_id):
    if current_user.role != 'employee':
        return jsonify({'error': 'Only employees can verify complaints.'}), 403

    data = request.get_json()
    remark = data.get('remark', '')
    action = data.get('action', '')  # should be 'close' or 'reopen'

    print(f"Employee {current_user.employee_id} verifying complaint {complaint_id} with action {action}")


    complaint = ComplaintDetail.query.get(complaint_id)
    if not complaint:
        return jsonify({'error': 'Complaint not found.'}), 404

    if complaint.employee_id != current_user.employee_id:
        return jsonify({'error': 'Not authorized to verify this complaint.'}), 403

    complaint.employee_remark = remark

    if action == 'close':
        complaint.status = 'Closed'
        complaint.closed_at = datetime.utcnow()
    elif action == 'reopen':
        complaint.status = 'Created'
        complaint.closed_at = None  # Reset closure

    db.session.commit()

    return jsonify({'message': 'Complaint updated successfully.'}), 200

@dashboard_bp.route('/complaint/<int:complaint_id>', methods=['GET'])
@login_required
def get_complaint(complaint_id):
    complaint = ComplaintDetail.query.join(Employee).outerjoin(Engineer).outerjoin(ComplaintType).outerjoin(Department).filter(ComplaintDetail.complaint_id == complaint_id).first_or_404()
    return jsonify({
        "id": complaint.complaint_id,
        "description": complaint.description,
        "status": complaint.status,
        "priority": complaint.type.priority if complaint.type else 1,
        "employee": complaint.employee.name if complaint.employee else '',
        "engineer": complaint.engineer.name if complaint.engineer else '',
        "adminRemark": complaint.admin_remark or '',
        "createdAt": complaint.created_at.strftime('%Y-%m-%d') if complaint.created_at else '',
    })


