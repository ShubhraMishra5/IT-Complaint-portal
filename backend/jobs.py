from datetime import datetime, timedelta
from extensions import db
from models import ComplaintDetail

def auto_close_old_complaints():
    """Auto-close complaints that are in 'Completed' state for over 7 days and not yet closed."""
    try:
        threshold_date = datetime.utcnow() - timedelta(days=7)

        complaints = ComplaintDetail.query.filter(
            ComplaintDetail.status == 'Completed',
            ComplaintDetail.closed_at.is_(None),
            ComplaintDetail.completed_at.isnot(None),
            ComplaintDetail.completed_at <= threshold_date
        ).all()

        for complaint in complaints:
            complaint.status = 'Closed'
            complaint.closed_at = datetime.utcnow()

        db.session.commit()
        print(f"[AUTO-CLOSURE] Auto-closed {len(complaints)} complaints at {datetime.utcnow().isoformat()}")

    except Exception as e:
        db.session.rollback()
        print(f"[AUTO-CLOSURE ERROR] {str(e)}")
