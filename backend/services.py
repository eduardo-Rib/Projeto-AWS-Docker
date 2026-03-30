import time
from datetime import datetime, timedelta
from sqlalchemy import text
from sqlalchemy.exc import OperationalError

from models import db, Transaction


def init_db_with_lock(app):
    retries = 15

    with app.app_context():
        while retries > 0:
            conn = None
            lock_acquired = False

            try:
                conn = db.engine.connect()

                conn.execute(text("SELECT pg_advisory_lock(987654321)"))
                lock_acquired = True

                db.create_all()
                print("Banco conectado e tabelas verificadas com sucesso.")
                return

            except OperationalError:
                print("Banco ainda não está pronto. Tentando novamente...")
                retries -= 1
                time.sleep(3)

            except Exception as e:
                print(f"Erro ao inicializar o banco: {e}")
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

        raise RuntimeError("Não foi possível inicializar o banco de dados.")


def duplicate_recurrent_if_needed(transaction):
    if not transaction.is_recurrent:
        return

    if transaction.type not in ["pagar", "receber"]:
        return

    next_due_date = transaction.due_date + timedelta(days=30)

    new_txn = Transaction(
        type=transaction.type,
        entity_name=transaction.entity_name,
        description=transaction.description,
        due_date=next_due_date,
        amount=transaction.amount,
        currency=None,
        status="pendente",
        is_recurrent=True,
        paid_at=None,
        cost_center_id=transaction.cost_center_id
    )

    db.session.add(new_txn)