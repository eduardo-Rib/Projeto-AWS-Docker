from flask import Flask
from database import db
import time
from sqlalchemy.exc import OperationalError, ProgrammingError, IntegrityError
from config import Config

app = Flask(__name__)
app.config.from_object(Config) 

db.init_app(app)

# importa models
from models import CentroCusto, Conta


def wait_for_db():
    tentativas = 10

    for i in range(tentativas):
        try:
            print(f"Tentando conectar ao banco... {i+1}/{tentativas}")

            with app.app_context():
                db.engine.connect()
                print("Banco conectado!")

                try:
                    db.create_all()
                    print("Tabelas criadas (ou já existentes)")
                except (ProgrammingError, IntegrityError):
                    print("Tabelas já existem, seguindo execução...")

                return

        except OperationalError:
            print("Banco não está pronto, aguardando...")
            time.sleep(3)

    raise Exception("Não foi possível conectar ao banco.")


wait_for_db()


@app.route("/")
def home():
    return {"status": "ok"}


if __name__ == "__main__":
    app.run(host="0.0.0.0", port=3000)