from flask import Flask, session
from flask_cors import CORS
from User import User
from AsyncCompute import AsyncCompute
from Settings import Settings
import logging
import config

app = Flask(__name__)

# activate CORS for all routes (for development purposes)
CORS(app, resources={r"/*": {"origins": "*", "supports_credentials": True}})
app.config['CORS_HEADERS'] = 'Content-Type'

logging.basicConfig(
    level=logging.INFO,  # show all log messages (DEBUG, INFO, WARNING, ERROR, CRITICAL)
    format="%(asctime)s [%(levelname)s] %(message)s"
)

#secret key for sessions >> encrypts cookies
app.secret_key = config.SECRET_KEY

logging.basicConfig(level=logging.DEBUG)

# Registriere die Routen
app.register_blueprint(User) 
app.register_blueprint(Settings)
app.register_blueprint(AsyncCompute)

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=8000)