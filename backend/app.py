import os
import time
import socket
from flask import Flask, jsonify, request
from flask_cors import CORS
from models import db, CostCenter, Transaction
from sqlalchemy.exc import OperationalError
from datetime import datetime

app = Flask(__name__)
CORS(app)

app.config['SQLALCHEMY_DATABASE_URI'] = os.getenv('DATABASE_URL', 'sqlite:///local.db')
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False

db.init_app(app)

# Lógica para esperar o banco ficar pronto
def init_db():
    with app.app_context():
        retries = 10
        while retries > 0:
            try:
                db.create_all() # Cria tabelas se não existirem (seguro para múltiplos backends)
                print("Banco de dados conectado e tabelas verificadas.")
                break
            except OperationalError:
                print("Aguardando banco de dados ficar pronto...")
                retries -= 1
                time.sleep(3)

init_db()

# Rota de teste solicitada (Healthcheck + Instance ID)
@app.route('/health', methods=['GET'])
def health_check():
    return jsonify({
        "status": "ok",
        "instance": socket.gethostname() # Retorna o ID do container Docker
    })

@app.route('/api/transactions', methods=['POST'])
def create_transaction():
    data = request.json
    new_txn = Transaction(
        type=data['type'],
        entity_name=data['entity_name'],
        due_date=datetime.strptime(data['due_date'], '%Y-%m-%d').date(),
        amount=data['amount'],
        is_recurrent=data.get('is_recurrent', False)
    )
    db.session.add(new_txn)
    db.session.commit()
    return jsonify({"message": "Conta cadastrada com sucesso!"}), 201

@app.route('/api/transactions/<int:id>/pay', methods=['POST'])
def pay_transaction(id):
    txn = Transaction.query.get_or_404(id)
    data = request.json
    
    txn.status = 'pago'
    txn.payment_date = datetime.strptime(data['payment_date'], '%Y-%m-%d').date()
    txn.currency = data['currency']
    txn.cost_center_id = data['cost_center_id']
    
    db.session.commit()
    return jsonify({"message": "Pagamento/Recebimento efetuado!"})

@app.route('/api/transactions', methods=['GET'])
def list_transactions():
    txns = Transaction.query.all()
    result = []
    for t in txns:
        result.append({
            "id": t.id, "type": t.type, "entity_name": t.entity_name,
            "due_date": t.due_date.strftime('%Y-%m-%d'), "amount": t.amount,
            "status": t.status, "is_recurrent": t.is_recurrent
        })
    return jsonify(result)

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000)