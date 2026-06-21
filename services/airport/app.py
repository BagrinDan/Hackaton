from flask import Flask
from models import db
from config import DATABASE_PATH
from broadcast import BroadcastClient
from gate_manager import GateManager
from routes import register_routes

def create_app():
    app = Flask(__name__)

    # Database config
    app.config["SQLALCHEMY_DATABASE_URI"] = f"sqlite:///{DATABASE_PATH}"
    app.config["SQLALCHEMY_TRACK_MODIFICATIONS"] = False

    # Initialize SQLAlchemy
    db.init_app(app)
    with app.app_context():
        db.create_all()

    # Create components
    broadcast_client = BroadcastClient()
    gate_manager = GateManager(app, broadcast_client)
    gate_manager.start_all()

    # Store on app for route handlers
    app.gate_manager = gate_manager

    # Register routes
    register_routes(app)

    return app


app = create_app()
