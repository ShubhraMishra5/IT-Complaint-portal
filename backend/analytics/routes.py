from flask import Blueprint, request, jsonify
from models import db, ComplaintDetail
from sqlalchemy import func

analytics_bp = Blueprint('analytics', __name__)

@analytics_bp.route('/api/pieChart')
def get_departmental_complaints():
    department_filter = request.args.get('department')

    query = db.session.query(
        ComplaintDetail.department,
        func.count(ComplaintDetail.id).label('count')
    )

    if department_filter:
        query = query.filter(ComplaintDetail.department == department_filter)

    query = query.group_by(ComplaintDetail.department)
    results = query.all()

    data = [{'department': d, 'count': c} for d, c in results]
    return jsonify(data)
