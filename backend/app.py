from flask import Flask
from config import Config
from database import db
from flask_cors import CORS
from routes.contas import contas_bp
from routes.centros import centros_bp

app = Flask(__name__)
app.config.from_object(Config)

CORS(app)

db.init_app(app)

with app.app_context():
    db.create_all()

app.register_blueprint(contas_bp)
app.register_blueprint(centros_bp)

@app.route('/')
def home():
    return {'status': 'ok'}

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=3000)