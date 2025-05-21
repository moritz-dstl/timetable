from flask import Flask
from flask_cors import CORS
from User import User
from timetable_compute import timetable_compute
import logging

app = Flask(__name__)

# activate CORS for all routes (for development purposes)
CORS(app, resources={r"/*": {"origins": "*", "supports_credentials": True}})
app.config['CORS_HEADERS'] = 'Content-Type'

#secret key for sessions >> encrypted cookies
app.secret_key = 'sessionKeyTimetable'

logging.basicConfig(level=logging.DEBUG)

# Registriere die Routen
app.register_blueprint(User) 
app.register_blueprint(timetable_compute)

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000)