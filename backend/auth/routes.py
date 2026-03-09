from flask import Blueprint, request, jsonify
from flask_login import login_user, logout_user, login_required, current_user
from models import Employee, Engineer
from extensions import db, login_manager
from utility.password_util import verify_password_scrypt, hash_password_scrypt
from sqlalchemy.exc import SQLAlchemyError

auth_bp = Blueprint('auth', __name__)

import logging
logging.basicConfig(level=logging.DEBUG)


# Flask-Login user loader
@login_manager.user_loader
def load_user(user_id):
    return db.session.get(Employee, int(user_id))


# LOGIN ROUTE
@auth_bp.route('/login', methods=['POST'])
def login():
    data = request.get_json()
    if not data:
        return jsonify({'error': 'Missing JSON'}), 400

    user_id = data.get('employee_id') or data.get('engineer_id')
    password = data.get('password')
    selected_role = data.get('role')

    if not user_id or not password or not selected_role:
        return jsonify({'error': 'Employee ID, password, and role are required.'}), 400

    # Define valid roles in Employee table
    valid_employee_roles = ['employee', 'admin', 'management']

    if selected_role in valid_employee_roles:
        user = Employee.query.filter_by(employee_id=user_id).first()
    elif selected_role == 'engineer':
        user = Engineer.query.filter_by(engineer_id=user_id).first()
    else:
        return jsonify({'error': 'Invalid role provided'}), 400

    if not user or not verify_password_scrypt(user.password, password):
        return jsonify({'error': 'Invalid ID or password.'}), 401

    # Optional: Validate user role if user has one
    if hasattr(user, 'role') and user.role != selected_role:
        return jsonify({'error': 'Invalid user role.'}), 403

    # Flask-Login
    login_user(user)

    response_data = {
        'message': f'{selected_role.capitalize()} logged in successfully.',
        'role': selected_role,
        'name': user.name
    }

    if selected_role in valid_employee_roles:
        response_data.update({
            'employee_id': user.employee_id,
            'email': user.email,
            'department': {
                'id': user.department.department_id,
                'name': user.department.dept_name
            } if user.department else None
        })
    elif selected_role == 'engineer':
        response_data.update({
            'engineer_id': user.engineer_id,
            'contact': user.contact,
            'expertise': user.expertise
        })

    return jsonify(response_data), 200

@auth_bp.route('/me', methods=['GET'])
@login_required
def get_logged_in_user():
    user = current_user
    return jsonify({
        "employee_id": user.employee_id,
        "name": user.name,
        "email": user.email,
        "department": {
            "id": user.department.department_id if user.department else None,
            "name": user.department.dept_name if user.department else None
        }
    }), 200

  
# LOGOUT ROUTE
@auth_bp.route('/logout', methods=['POST'])
@login_required
def logout():
    logout_user()
    return jsonify({'message': 'User logged out successfully.'}), 200


# WHOAMI ROUTE
@auth_bp.route('/whoami', methods=['GET'])
@login_required
def whoami():
    user = current_user

    if isinstance(user, Employee):
        return jsonify({
            'user_id': user.employee_id,
            'email': user.email,
            'role': user.role
        }), 200

    elif isinstance(user, Engineer):
        return jsonify({
            'user_id': user.engineer_id,
            'email': None,
            'role': 'engineer'
        }), 200

    return jsonify({'error': 'Unknown user type'}), 400



@auth_bp.route('/profile', methods=['GET'])
@login_required
def profile():
    user = current_user
    if isinstance(user, Employee):
        return jsonify({
            'employeeId': user.employee_id,
            'name': user.name,
            'email': user.email,
            'role': user.role,
            'department': {
                "id": user.department.department_id if user.department else None,
                "name": user.department.dept_name if user.department else None
            }
        })

    elif isinstance(user, Engineer):
        return jsonify({
            'engineerId': user.engineer_id,
            'name': user.name,
            'email': None,  # You can include engineer email if it exists
            'role': 'engineer',
            'expertise': user.expertise,
            'contact': user.contact
        })

    return jsonify({'error': 'Unknown user type'}), 400




# RESET PASSWORD ROUTE
@auth_bp.route('/reset-password', methods=['POST'])
@login_required
def reset_password():
    data = request.json
    new_password = data.get('new_password')

    if not new_password or len(new_password) < 6:
        return jsonify({'error': 'Password must be at least 6 characters long.'}), 400

    current_user.password = hash_password_scrypt(new_password)
    db.session.commit()

    return jsonify({'message': 'Password updated successfully.'}), 200

@login_manager.user_loader
def load_user(user_id):
    user = Employee.query.filter_by(employee_id=user_id).first()
    if not user:
        user = Engineer.query.filter_by(engineer_id=user_id).first()
    return user

