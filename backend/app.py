from flask import Flask
from flask_cors import CORS

from config import Config
from models import db
from routes import api
from services import init_db_with_lock

app = Flask(__name__)
app.config.from_object(Config)

CORS(app)
db.init_app(app)
app.register_blueprint(api)

init_db_with_lock(app)

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5000)