import socket
from datetime import datetime

from flask import Blueprint, jsonify, request
from models import db, Transaction, CostCenter
from services import duplicate_recurrent_if_needed

api = Blueprint("api", __name__)


@api.route("/health", methods=["GET"])
def health_check():
    return jsonify({
        "status": "ok",
        "instance": socket.gethostname()
    }), 200


@api.route("/api/cost-centers", methods=["GET"])
def list_cost_centers():
    cost_centers = CostCenter.query.order_by(CostCenter.name.asc()).all()
    return jsonify([c.to_dict() for c in cost_centers]), 200


@api.route("/api/cost-centers", methods=["POST"])
def create_cost_center():
    data = request.get_json()

    name = (data.get("name") or "").strip()
    description = (data.get("description") or "").strip() or None

    if not name:
        return jsonify({"message": "Nome do centro de custo é obrigatório."}), 400

    existing = CostCenter.query.filter_by(name=name).first()
    if existing:
        return jsonify({"message": "Já existe um centro de custo com esse nome."}), 400

    cost_center = CostCenter(name=name, description=description)
    db.session.add(cost_center)
    db.session.commit()

    return jsonify(cost_center.to_dict()), 201


@api.route("/api/transactions", methods=["GET"])
def list_transactions():
    transactions = Transaction.query.order_by(Transaction.due_date.asc()).all()
    return jsonify([t.to_dict() for t in transactions]), 200


@api.route("/api/transactions", methods=["POST"])
def create_transaction():
    data = request.get_json()

    txn_type = data.get("type")
    entity_name = (data.get("entity_name") or "").strip()
    description = (data.get("description") or "").strip() or None
    due_date = data.get("due_date")
    amount = data.get("amount")
    is_recurrent = bool(data.get("is_recurrent", False))
    cost_center_id = data.get("cost_center_id")

    if txn_type not in ["pagar", "receber"]:
        return jsonify({"message": "Tipo inválido. Use 'pagar' ou 'receber'."}), 400

    if not entity_name:
        return jsonify({"message": "Informe quem vai pagar ou de quem vai receber."}), 400

    if not due_date:
        return jsonify({"message": "Data de vencimento é obrigatória."}), 400

    if amount is None:
        return jsonify({"message": "Valor é obrigatório."}), 400

    try:
        parsed_due_date = datetime.strptime(due_date, "%Y-%m-%d").date()
        parsed_amount = float(amount)
    except ValueError:
        return jsonify({"message": "Dados inválidos."}), 400

    transaction = Transaction(
        type=txn_type,
        entity_name=entity_name,
        description=description,
        due_date=parsed_due_date,
        amount=parsed_amount,
        status="pendente",
        is_recurrent=is_recurrent,
        cost_center_id=cost_center_id
    )

    db.session.add(transaction)
    db.session.commit()

    return jsonify(transaction.to_dict()), 201


@api.route("/api/transactions/<int:transaction_id>/pay", methods=["POST"])
def pay_transaction(transaction_id):
    data = request.get_json()
    transaction = Transaction.query.get_or_404(transaction_id)

    payment_date = data.get("payment_date")
    currency = (data.get("currency") or "").strip()
    cost_center_id = data.get("cost_center_id")

    if not payment_date:
        return jsonify({"message": "Data do pagamento/recebimento é obrigatória."}), 400

    if not currency:
        return jsonify({"message": "Moeda é obrigatória."}), 400

    try:
        parsed_payment_date = datetime.strptime(payment_date, "%Y-%m-%d").date()
    except ValueError:
        return jsonify({"message": "Data de pagamento inválida."}), 400

    transaction.status = "pago"
    transaction.paid_at = parsed_payment_date
    transaction.currency = currency
    transaction.cost_center_id = cost_center_id

    duplicate_recurrent_if_needed(transaction)

    db.session.commit()

    return jsonify(transaction.to_dict()), 200


@api.route("/api/dashboard", methods=["GET"])
def dashboard():
    transactions = Transaction.query.all()

    total_receber = sum(t.amount for t in transactions if t.type == "receber")
    total_pagar = sum(t.amount for t in transactions if t.type == "pagar")
    pendentes = sum(1 for t in transactions if t.status == "pendente")
    pagas = sum(1 for t in transactions if t.status == "pago")

    return jsonify({
        "total_receber": total_receber,
        "total_pagar": total_pagar,
        "saldo": total_receber - total_pagar,
        "pendentes": pendentes,
        "pagas": pagas
    }), 200