from flask_sqlalchemy import SQLAlchemy

db = SQLAlchemy()


class Arrival(db.Model):
    """A guest arriving at passport control.

    Lifecycle: queued -> processing -> processed
    """
    __tablename__ = "arrivals"

    id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    guest_id = db.Column(db.String, nullable=False, index=True)
    name = db.Column(db.String, nullable=False)
    surname = db.Column(db.String, nullable=False)
    age = db.Column(db.Integer, nullable=False)
    passport_type = db.Column(db.String, nullable=False)  # "EU" or "non-EU"
    priority = db.Column(db.String, nullable=False, default="standard")  # "standard", "fast"
    disability = db.Column(db.Boolean, nullable=False, default=False)
    status = db.Column(db.String, nullable=False, default="queued")  # "queued", "processing", "processed"
    gate = db.Column(db.String, nullable=True)
    queued_at = db.Column(db.Float, nullable=False)  # game seconds
    processed_at = db.Column(db.Float, nullable=True)  # game seconds
    wait_time_seconds = db.Column(db.Float, nullable=True)  # processed_at - queued_at
