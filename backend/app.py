import os
import time
import socket
from datetime import datetime

from flask import Flask, jsonify, request
from flask_cors import CORS
from sqlalchemy import text
from sqlalchemy.exc import OperationalError

from models import db, Transaction

app = Flask(__name__)
CORS(app)

app.config['SQLALCHEMY_DATABASE_URI'] = os.getenv('DATABASE_URL', 'sqlite:///local.db')
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False

db.init_app(app)


def init_db():
    retries = 15

    with app.app_context():
        while retries > 0:
            lock_acquired = False
            conn = None

            try:
                conn = db.engine.connect()
                conn.execute(text("SELECT pg_advisory_lock(987654321)"))
                lock_acquired = True

                db.create_all()
                print("Banco de dados conectado e tabelas verificadas com sucesso.")
                break

            except OperationalError:
                print("Aguardando banco de dados ficar pronto...")
                retries -= 1
                time.sleep(3)

            except Exception as e:
                print(f"Erro ao inicializar banco: {e}")
                retries -= 1
                time.sleep(3)

            finally:
                if conn is not None:
                    try:
                        if lock_acquired:
                            conn.execute(text("SELECT pg_advisory_unlock(987654321)"))
                    except Exception:
                        pass

                    try:
                        conn.close()
                    except Exception:
                        pass

        if retries == 0:
            raise RuntimeError("Não foi possível inicializar o banco de dados.")


init_db()


@app.route('/health', methods=['GET'])
def health_check():
    return jsonify({
        "status": "ok",
        "instance": socket.gethostname()
    }), 200


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

    return jsonify({"message": "Pagamento/Recebimento efetuado!"}), 200


@app.route('/api/transactions', methods=['GET'])
def list_transactions():
    txns = Transaction.query.all()
    result = []

    for t in txns:
        result.append({
            "id": t.id,
            "type": t.type,
            "entity_name": t.entity_name,
            "due_date": t.due_date.strftime('%Y-%m-%d'),
            "amount": t.amount,
            "status": t.status,
            "is_recurrent": t.is_recurrent
        })

    return jsonify(result), 200


if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000)