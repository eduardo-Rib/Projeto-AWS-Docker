from flask import Flask
from config import Config
from database import db
from flask_cors import CORS
from routes.contas import contas_bp
from routes.centros import centros_bp
import time
from sqlalchemy.exc import OperationalError

app = Flask(__name__)
app.config.from_object(Config)

CORS(app)

db.init_app(app)

def wait_for_db():
    for i in range(10):
        try:
            with app.app_context():
                db.create_all()
            print("anco conectado com sucesso!")
            return
        except OperationalError:
            print(f"Banco não está pronto... tentativa {i+1}/10")
            time.sleep(3)
    
    print("Não foi possível conectar ao banco.")
    exit(1)

wait_for_db()

app.register_blueprint(contas_bp)
app.register_blueprint(centros_bp)

@app.route('/')
def home():
    return {'status': 'ok'}

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=3000)