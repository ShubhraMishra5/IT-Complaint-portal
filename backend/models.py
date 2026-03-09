from flask_sqlalchemy import SQLAlchemy
from flask_login import UserMixin
from sqlalchemy import CheckConstraint, text
from typing import Optional
from datetime import datetime 

from extensions import db  

class ComplaintType(db.Model):
    __tablename__ = 'complaint_type'
    __table_args__ = (
        db.PrimaryKeyConstraint('type_id', name='complaint_type_pkey'),
        db.UniqueConstraint('category', 'priority', name='unique_category_priority')
    )

    type_id = db.Column(db.Integer, primary_key=True)
    category = db.Column(db.String(100))
    subcategory = db.Column(db.Text)
    priority = db.Column(db.Integer, nullable=True)

    complaint_detail = db.relationship('ComplaintDetail', back_populates='type')

    def __repr__(self):
        return f"<ComplaintType category={self.category}, priority={self.priority}>"


class Department(db.Model):
    __tablename__ = 'department'
    __table_args__ = (
        db.PrimaryKeyConstraint('department_id', name='department_pkey'),
        db.UniqueConstraint('dept_name', name='department_dept_name_key')
    )

    department_id = db.Column(db.Integer, primary_key=True)
    dept_name = db.Column(db.String(100))
    complaints = db.relationship("ComplaintDetail", back_populates="department")

    employee = db.relationship('Employee', back_populates='department')

    def __repr__(self):
        return f"<Department {self.dept_name}>"


class Engineer(db.Model, UserMixin):
    __tablename__ = 'engineer'
    __table_args__ = (
        CheckConstraint("contact ~ '^[0-9]{10}$'", name='engineer_contact_check'),
        CheckConstraint("expertise IN ('network', 'software', 'hardware')", name='engineer_expertise_check'),
        db.PrimaryKeyConstraint('engineer_id', name='engineer_pkey')
    )

    engineer_id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100))
    expertise = db.Column(db.String(50))
    contact = db.Column(db.String(15), nullable=True)
    password = db.Column(db.String(128), nullable=False)
    

    def get_id(self):
        return str(self.engineer_id)
    
    @property
    def is_authenticated(self):
        return True

    @property
    def is_active(self):
        return True

    @property
    def is_anonymous(self):
        return False
    
    @property
    def role(self):
        return 'engineer'

    complaint_detail = db.relationship('ComplaintDetail', back_populates='engineer')

    def __repr__(self):
        return f"<Engineer {self.name}, expertise={self.expertise}>"


class Employee(db.Model, UserMixin):
    __tablename__ = 'employee'
    __table_args__ = (
        CheckConstraint("role IN ('employee', 'admin', 'engineer', 'management')", name='employee_role_check'),
        db.ForeignKeyConstraint(['department_id'], ['department.department_id'], name='employee_department_id_fkey'),
        db.PrimaryKeyConstraint('employee_id', name='employee_pkey'),
        db.UniqueConstraint('email', name='employee_email_key')
    )

    employee_id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100))
    email = db.Column(db.String(100))
    password = db.Column(db.Text)
    role = db.Column(db.String(20))
    department_id = db.Column(db.Integer, nullable=True)

    department = db.relationship('Department', back_populates='employee')
    complaint_detail = db.relationship('ComplaintDetail', back_populates='employee')

    def get_id(self):
        return str(self.employee_id)

    def __repr__(self):
        return f"<Employee {self.name}, role={self.role}>"


class ComplaintDetail(db.Model):
    __tablename__ = 'complaint_detail'
    __table_args__ = (
        CheckConstraint("status IN ('Created', 'Assigned', 'In Progress', 'Completed', 'Closed')", name='complaint_detail_status_check'),
        db.ForeignKeyConstraint(['employee_id'], ['employee.employee_id'], name='complaint_detail_employee_id_fkey'),
        db.ForeignKeyConstraint(['engineer_id'], ['engineer.engineer_id'], name='complaint_detail_engineer_id_fkey'),
        db.ForeignKeyConstraint(['type_id'], ['complaint_type.type_id'], name='complaint_detail_type_id_fkey'),
        db.PrimaryKeyConstraint('complaint_id', name='complaint_detail_pkey')
    )

    complaint_id = db.Column(db.Integer, primary_key=True)
    employee_id = db.Column(db.Integer, nullable=True)
    engineer_id = db.Column(db.Integer, nullable=True)
    type_id = db.Column(db.Integer, nullable=True)
    status = db.Column(db.String(50), nullable=True)
    description = db.Column(db.Text, nullable=True)
    created_at = db.Column(db.DateTime, server_default=text('CURRENT_TIMESTAMP'))
    started_at = db.Column(db.DateTime, nullable=True)
    completed_at = db.Column(db.DateTime, nullable=True)
    closed_at = db.Column(db.DateTime, nullable=True)
    employee_remark = db.Column(db.Text, nullable=True)
    engineer_remark = db.Column(db.Text, nullable=True)
    admin_remark = db.Column(db.Text, nullable=True)
    name = db.Column(db.String(100))
    email = db.Column(db.String(100))
    
    

    employee = db.relationship('Employee', back_populates='complaint_detail')
    engineer = db.relationship('Engineer', back_populates='complaint_detail')
    type = db.relationship('ComplaintType', back_populates='complaint_detail')
    department_id = db.Column(
    db.Integer,
    db.ForeignKey('department.department_id'),
    nullable=True 
)
    department = db.relationship('Department', back_populates='complaints')

    def __repr__(self):
        return f"<Complaint id={self.complaint_id}, status={self.status}>"
