from models import db, Arrival
from sqlalchemy import func
from game_time import game_now


def get_stats() -> dict:
    """Compute aggregate airport statistics."""

    total_arrivals = Arrival.query.count()
    total_processed = Arrival.query.filter_by(status="processed").count()
    currently_queued = Arrival.query.filter_by(status="queued").count()
    currently_processing = Arrival.query.filter_by(status="processing").count()

    # Wait time stats
    wait_q = db.session.query(
        func.avg(Arrival.wait_time_seconds).label("avg_wait"),
        func.max(Arrival.wait_time_seconds).label("max_wait"),
        func.min(Arrival.wait_time_seconds).label("min_wait"),
    ).filter(Arrival.status == "processed").first()

    # Gate distribution
    gate_rows = (
        db.session.query(Arrival.gate, func.count())
        .filter(Arrival.status == "processed")
        .group_by(Arrival.gate)
        .all()
    )

    # Passport distribution
    passport_rows = (
        db.session.query(Arrival.passport_type, func.count())
        .group_by(Arrival.passport_type)
        .all()
    )

    # Priority distribution
    priority_rows = (
        db.session.query(Arrival.priority, func.count())
        .group_by(Arrival.priority)
        .all()
    )

    return {
        "total_arrivals": total_arrivals,
        "total_processed": total_processed,
        "currently_in_queue": currently_queued,
        "currently_processing": currently_processing,
        "avg_wait_time_seconds": wait_q.avg_wait or 0,
        "max_wait_time_seconds": wait_q.max_wait or 0,
        "min_wait_time_seconds": wait_q.min_wait or 0,
        "gate_distribution": {gate: count for gate, count in gate_rows},
        "passport_distribution": {pt: count for pt, count in passport_rows},
        "priority_distribution": {p: count for p, count in priority_rows},
        "current_game_time": game_now(),
    }
