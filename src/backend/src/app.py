from flask import Flask
from flask_cors import CORS
from .api_endpoints.User import User
from .api_endpoints.AsyncCompute import AsyncCompute
from .api_endpoints.Settings import Settings
import logging
import os

"""
This is the main entry point of the Flask backend application. It initializes
the Flask app, configures CORS, logging, session handling, and registers
all route blueprints.
"""

app = Flask(__name__)

# activate CORS for all routes (for development purposes)
CORS(app, resources={r"/*": {"origins": "*", "supports_credentials": True}})
app.config['CORS_HEADERS'] = 'Content-Type'

logging.basicConfig(
    level=logging.INFO,  # show all log messages (DEBUG, INFO, WARNING, ERROR, CRITICAL)
    format="%(asctime)s [%(levelname)s] %(message)s"
)

#secret key for sessions >> encrypts cookies
app.secret_key = os.environ.get("SECRET_KEY")

logging.basicConfig(level=logging.DEBUG)

# Registriere die Routen
app.register_blueprint(User) 
app.register_blueprint(Settings)
app.register_blueprint(AsyncCompute)

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=8000)