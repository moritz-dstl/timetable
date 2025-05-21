import mysql.connector
from datetime import datetime
import config
import pytz


# Verbindung zur MariaDB-Datenbank mittels daten aus config.py
def get_db_connection():
    conn = mysql.connector.connect(
        host=config.DB_HOST,
        user=config.DB_USER,
        password=config.DB_PASSWORD,
        database=config.DB_NAME
    )
    return conn


def check_existing_user(email):

    conn = get_db_connection()
    cursor = conn.cursor()

    cursor.execute("SELECT Uid FROM Users WHERE email = %s", (email,))
    existing_user_check = cursor.fetchone()

    cursor.close()
    conn.close()

    if existing_user_check:
        return True #es existiert bereits ein User mit dieser Email adresse
    
    else:
        return False

