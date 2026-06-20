from flask import request, jsonify
from marshmallow import ValidationError
from models import Arrival
from schemas import ArrivalInputSchema, ArrivalSchema
from game_time import game_now
from stats import get_stats

arrival_input_schema = ArrivalInputSchema()
arrival_schema = ArrivalSchema()
arrivals_schema = ArrivalSchema(many=True)


def register_routes(app):

    @app.route("/arrivals", methods=["POST"])
    def create_arrival():
        data = request.get_json(silent=True)
        if not data:
            return jsonify({"error": "Request body must be valid JSON"}), 400

        try:
            guest = arrival_input_schema.load(data)
        except ValidationError as err:
            return jsonify({"errors": err.messages}), 400

        existing = Arrival.query.filter_by(guest_id=guest["guest_id"]) \
            .filter(Arrival.status.in_(["queued", "processing"])).first()
        if existing:
            
            return jsonify({"error": "Guest already has an active arrival"}), 409
        result = app.gate_manager.assign_and_enqueue(guest)
        return jsonify(result), 202

    @app.route("/arrivals/<guest_id>", methods=["GET"])
    def get_arrival(guest_id):
        guest = app.gate_manager.get_guest(guest_id)
        if not guest:
            return jsonify({"error": "Guest not found"}), 404

        position = None
        if guest["status"] in ("queued", "processing"):
            position = app.gate_manager.get_guest_position(guest_id, guest["gate"])

        if guest["status"] == "processed":
            wait_time = guest["wait_time_seconds"]
        else:
            wait_time = game_now() - guest["queued_at"]

        return jsonify({
            "guest_id": guest["guest_id"],
            "status": guest["status"],
            "gate": guest["gate"],
            "position": position,
            "queued_at": guest["queued_at"],
            "processed_at": guest.get("processed_at"),
            "wait_time_seconds": wait_time,
        }), 200

    @app.route("/arrivals", methods=["GET"])
    def list_arrivals():
        query = Arrival.query

        status = request.args.get("status")
        if status:
            query = query.filter_by(status=status)

        passport_type = request.args.get("passport_type")
        if passport_type:
            query = query.filter_by(passport_type=passport_type)

        limit_param = request.args.get("limit")
        if limit_param is None:
            arrivals = query.order_by(Arrival.queued_at.desc()).all()
            return jsonify({
                "arrivals": arrivals_schema.dump(arrivals),
                "next_cursor": None,
                "total": len(arrivals),
            }), 200

        try:
            limit = int(limit_param)
            if limit <= 0:
                raise ValueError
        except ValueError:
            return jsonify({"errors": {"limit": ["Must be a positive integer."]}}), 400

        total = query.count()
        paged_query = query.order_by(Arrival.id.asc())

        cursor_param = request.args.get("cursor")
        if cursor_param is not None:
            try:
                cursor_id = int(cursor_param)
            except ValueError:
                return jsonify({"errors": {"cursor": ["Must be a valid cursor."]}}), 400
            paged_query = paged_query.filter(Arrival.id > cursor_id)

        rows = paged_query.limit(limit + 1).all()

        next_cursor = None
        if len(rows) > limit:
            next_cursor = str(rows[limit - 1].id)
            rows = rows[:limit]

        return jsonify({
            "arrivals": arrivals_schema.dump(rows),
            "next_cursor": next_cursor,
            "total": total,
        }), 200

    @app.route("/queue", methods=["GET"])
    def get_queue():
        return jsonify(app.gate_manager.get_all_gates_status()), 200

    @app.route("/stats", methods=["GET"])
    def get_stats_route():
        return jsonify(get_stats()), 200

    @app.route("/health", methods=["GET"])
    def health():
        return jsonify({"status": "ok"}), 200
