from flask import Blueprint, request, jsonify
from models import Conta
from database import db
from datetime import datetime
from utils import dias_para_vencer

contas_bp = Blueprint('contas', __name__)

@contas_bp.route('/contas', methods=['POST'])
def criar():
    data = request.json
    conta = Conta(**data)
    db.session.add(conta)
    db.session.commit()
    return {'msg': 'ok'}

@contas_bp.route('/contas', methods=['GET'])
def listar():
    contas = Conta.query.all()
    result = []

    for c in contas:
        dias = dias_para_vencer(c.vencimento)

        result.append({
            'id': c.id,
            'descricao': c.descricao,
            'valor': c.valor,
            'tipo': c.tipo,
            'vencimento': c.vencimento.isoformat(),
            'paga': c.paga,
            'alerta': dias <= 7 and not c.paga
        })

    return jsonify(result)

@contas_bp.route('/contas/<int:id>/pagar', methods=['PUT'])
def pagar(id):
    conta = Conta.query.get(id)
    conta.paga = True
    conta.data_pagamento = datetime.now()
    db.session.commit()
    return {'msg': 'pago'}