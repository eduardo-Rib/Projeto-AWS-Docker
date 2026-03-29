from flask_sqlalchemy import SQLAlchemy

db = SQLAlchemy()


class CostCenter(db.Model):
    __tablename__ = 'cost_center'

    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), nullable=False)


class Transaction(db.Model):
    __tablename__ = 'transaction'

    id = db.Column(db.Integer, primary_key=True)
    type = db.Column(db.String(20), nullable=False)  # 'pagar' ou 'receber'
    entity_name = db.Column(db.String(100), nullable=False)  # Quem paga ou recebe
    due_date = db.Column(db.Date, nullable=False)
    amount = db.Column(db.Float, nullable=False)
    is_recurrent = db.Column(db.Boolean, default=False)

    # Dados do pagamento (preenchidos depois)
    status = db.Column(db.String(20), default='pendente')  # 'pendente' ou 'pago'
    payment_date = db.Column(db.Date, nullable=True)
    currency = db.Column(db.String(10), nullable=True)
    cost_center_id = db.Column(db.Integer, db.ForeignKey('cost_center.id'), nullable=True)

    cost_center = db.relationship('CostCenter', backref='transactions')