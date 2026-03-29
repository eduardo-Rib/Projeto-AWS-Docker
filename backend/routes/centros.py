from flask import Blueprint, request
from models import CentroCusto
from database import db

centros_bp = Blueprint('centros', __name__)

@centros_bp.route('/centros', methods=['POST'])
def criar():
    c = CentroCusto(nome=request.json['nome'])
    db.session.add(c)
    db.session.commit()
    return {'msg': 'ok'}

@centros_bp.route('/centros', methods=['GET'])
def listar():
    return [
        {'id': c.id, 'nome': c.nome}
        for c in CentroCusto.query.all()
    ]