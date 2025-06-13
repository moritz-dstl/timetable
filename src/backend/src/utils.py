import mysql.connector
import os
import pytz
import bcrypt


"""
This module provides utility functions for database access and user authentication.

Functionality:
- `get_db_connection()`:
  Establishes a connection to the MySQL/MariaDB database using environment variables.

- `hash_password()`:
  Hashes and salts a plain-text password using bcrypt.

- `check_password()`:
  Verifies a password against the stored hash for a given email.

- `check_existing_user()`:
  Checks whether a user with the given email already exists in the database.

Technologies:
- mysql-connector for database connection
- bcrypt for secure password hashing
- Environment variables for configuration
"""



def get_db_connection():
    """
    Connects to the MariaDB database using environment variable credentials

    Returns:
        A MySQL database connection object.
    """
    conn = mysql.connector.connect(
        host=os.environ.get("DB_HOST"),
        user=os.environ.get("DB_USER"),
        password=os.environ.get("DB_PASSWORD"),
        database=os.environ.get("DB_NAME")
    )
    return conn


def hash_password(password):
    """
    Expects a plain-text password
    Returns:
        A securely hashed and salted password as bytes.
    """
    # konverts passwort in bytes
    password_bytes = password.encode('utf-8')
    # generat Salt
    salt = bcrypt.gensalt()
    # hash the password with the salt
    hashed_password = bcrypt.hashpw(password_bytes, salt)
    return hashed_password


def check_password(password, email):
    """
    Expects a plain-text password and email address.
    Returns:
        True if the password matches the stored hash for the given email,
        False otherwise.
    """
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
    """
    Returns:
        True if a user with the given email exists in the database,
        False otherwise.
    """

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

