# config.py
DB_USER = "root"
DB_PASSWORD = "DB_PASSWORD" # in a real-world scenario, this should be stored securely
DB_HOST = "mariadb-container"
DB_NAME = "timetable-database"

SQLALCHEMY_DATABASE_URI = f"mysql+pymysql://{DB_USER}:{DB_PASSWORD}@{DB_HOST}/{DB_NAME}"
SQLALCHEMY_TRACK_MODIFICATIONS = False
