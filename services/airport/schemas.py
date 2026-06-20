from marshmallow import Schema, fields, validate
from marshmallow_sqlalchemy import SQLAlchemyAutoSchema
from models import Arrival, db


class ArrivalInputSchema(Schema):
    guest_id = fields.String(required=True, validate=validate.Length(min=1))
    name = fields.String(required=True, validate=validate.Length(min=1))
    surname = fields.String(required=True, validate=validate.Length(min=1))
    age = fields.Integer(required=True, strict=True, validate=validate.Range(min=1))
    passport_type = fields.String(required=True, validate=validate.OneOf(["EU", "non-EU"]))
    priority = fields.String(required=True, validate=validate.OneOf(["standard", "fast"]))
    disability = fields.Boolean(load_default=False)


class ArrivalSchema(SQLAlchemyAutoSchema):
    class Meta:
        model = Arrival
        sqla_session = db.session
        load_instance = True
