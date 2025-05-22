from flask import Flask, session
from flask_cors import CORS
from User import User
from Timetable_compute import Timetable_compute
from AsyncCompute import AsyncCompute
from Settings import Settings
import logging

app = Flask(__name__)

# activate CORS for all routes (for development purposes)
CORS(app, resources={r"/*": {"origins": "*", "supports_credentials": True}})
app.config['CORS_HEADERS'] = 'Content-Type'

logging.basicConfig(
    level=logging.INFO,  # show all log messages (DEBUG, INFO, WARNING, ERROR, CRITICAL)
    format="%(asctime)s [%(levelname)s] %(message)s"
)

#secret key for sessions >> encrypted cookies
app.secret_key = 'sessionKeyTimetable'

logging.basicConfig(level=logging.DEBUG)

# Registriere die Routen
app.register_blueprint(User) 
app.register_blueprint(Timetable_compute)
app.register_blueprint(Settings)
app.register_blueprint(AsyncCompute)

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=8000)