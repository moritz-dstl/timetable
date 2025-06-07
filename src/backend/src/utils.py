import mysql.connector
from . import config
import bcrypt


# Verbindung zur MariaDB-Datenbank mittels daten aus config.py
def get_db_connection():
    conn = mysql.connector.connect(
        host=config.DB_HOST,
        user=config.DB_USER,
        password=config.DB_PASSWORD,
        database=config.DB_NAME
    )
    return conn


def hash_password(password):
    # konverts passwort in bytes
    password_bytes = password.encode('utf-8')
    # generat Salt
    salt = bcrypt.gensalt()
    # hash the password with the salt
    hashed_password = bcrypt.hashpw(password_bytes, salt)
    return hashed_password


def check_password(password, email):
    password_to_verify = password.encode('utf-8')

    # get the hashed password from the database
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("Select password FROM Users WHERE email = %s", (email,))
    hashed_password = cursor.fetchone()

    cursor.close()
    conn.close()

    # check if the hashed password exists >> user exists
    if hashed_password is None:
        return False

    if bcrypt.checkpw(password_to_verify, hashed_password[0].encode('utf-8')):
        return True
    else:
        return False


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

