from flask_sqlalchemy import SQLAlchemy
from datetime import date

db = SQLAlchemy()


class CostCenter(db.Model):
    __tablename__ = "cost_centers"

    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), nullable=False, unique=True)
    description = db.Column(db.String(255), nullable=True)

    transactions = db.relationship("Transaction", back_populates="cost_center")

    def to_dict(self):
        return {
            "id": self.id,
            "name": self.name,
            "description": self.description
        }


class Transaction(db.Model):
    __tablename__ = "transactions"

    id = db.Column(db.Integer, primary_key=True)
    type = db.Column(db.String(20), nullable=False)  # pagar | receber
    entity_name = db.Column(db.String(150), nullable=False)
    description = db.Column(db.String(255), nullable=True)
    due_date = db.Column(db.Date, nullable=False)
    amount = db.Column(db.Float, nullable=False)
    currency = db.Column(db.String(10), nullable=True)
    status = db.Column(db.String(20), nullable=False, default="pendente")  # pendente | pago
    is_recurrent = db.Column(db.Boolean, default=False)
    paid_at = db.Column(db.Date, nullable=True)
    created_at = db.Column(db.Date, nullable=False, default=date.today)

    cost_center_id = db.Column(db.Integer, db.ForeignKey("cost_centers.id"), nullable=True)
    cost_center = db.relationship("CostCenter", back_populates="transactions")

    def to_dict(self):
        return {
            "id": self.id,
            "type": self.type,
            "entity_name": self.entity_name,
            "description": self.description,
            "due_date": self.due_date.strftime("%Y-%m-%d"),
            "amount": self.amount,
            "currency": self.currency,
            "status": self.status,
            "is_recurrent": self.is_recurrent,
            "paid_at": self.paid_at.strftime("%Y-%m-%d") if self.paid_at else None,
            "created_at": self.created_at.strftime("%Y-%m-%d"),
            "cost_center_id": self.cost_center_id,
            "cost_center_name": self.cost_center.name if self.cost_center else None
        }