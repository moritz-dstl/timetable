from flask import request, jsonify, session, Blueprint
from ..utils import get_db_connection, hash_password, check_password, check_existing_user


"""
This module manages user-related functionality, including registration, login,
session handling, and basic user data retrieval in a Flask-based backend system.

Available Routes:
- POST /User/register:
  Registers a new user with email, password, and school name. Ensures unique email
  and hashes the password before storing it in the database.

- POST /User/login:
  Authenticates a user by checking the provided email and password.
  On success, stores the user's UID in the session.

- GET /User/get_school:
  Retrieves the school name for the currently logged-in user.

- POST /User/logout:
  Clears the current user session, logging the user out.

Technologies:
- Flask Blueprint for organizing user-related routes
- Session for user authentication state
- Utility functions for password hashing and verification
- MariaDB
"""


# Create a Blueprint for the "User" area
User = Blueprint('User', __name__)

@User.route('/User/register', methods=['POST'])
# creates new database entry in Users without system admin rights
def register_user():
    # Get user data from the request
    new_email = request.json.get('email')
    new_password = request.json.get('password')  # unhashed password
    new_password = hash_password(new_password)  # hash and salt the password
    new_school_name = request.json.get('school_name') 
    

    # Check if all required fields are provided
    if all([new_email, new_password, new_school_name]):
        conn = get_db_connection()
        cursor = conn.cursor(buffered=True)  # Use buffered cursor to fetch all results immediately

        # Check if the email is already in use
        email_already_used = check_existing_user(new_email)

        if not email_already_used:
            # Insert new user into the database
            cursor.execute(
                "INSERT INTO Users (email, password, school_name) VALUES (%s, %s,%s)",
                (new_email, new_password, new_school_name)
            )
            conn.commit()
            cursor.close()
            conn.close()

            return jsonify({"message": "User successfully added"}), 201
        
        else:
            # Email is already taken
            cursor.close()
            conn.close()
            return jsonify({"message": "A user with this email already exists"}), 400

    else:
        return jsonify({"message": "Missing user data"}), 400


@User.route('/User/login', methods=['POST'])
def login():
    # Get login data from the request
    email = request.json.get('email')
    password = request.json.get('password')

    conn = get_db_connection()
    cursor = conn.cursor()

    # Search for user with this email
    cursor.execute("SELECT Uid FROM Users WHERE email = %s", (email,))
    user = cursor.fetchone()

    # Check if user exists and password matches
    if user and check_password(password, email):  # user[1] = password from DB
        session["Uid"] = user[0]
        cursor.close()
        conn.close()

        return jsonify({'message': 'Login success!'}), 200
    else:
        cursor.close()
        conn.close()
        return jsonify({'message': 'Invalid login credentials!'}), 401
    

@User.route('/User/get_school', methods=['GET'])
def get_school():
    Uid = session.get('Uid')
    if Uid is None:
        return jsonify({"error": "No UID found in session"}), 403

    conn = get_db_connection()
    cursor = conn.cursor()

    # Get the school name for the current user
    cursor.execute("SELECT school_name FROM Users WHERE Uid = %s", (Uid,))
    school_name = cursor.fetchone()

    cursor.close()
    conn.close()

    if school_name:
        return jsonify({"school_name": school_name[0]}), 200
    else:
        return jsonify({"error": "School not found"}), 404

@User.route('/User/logout', methods=['POST'])
# Clears the current user session
def logout():
    session.clear()
    return jsonify({'message': 'Successfully logged out!'}), 200
