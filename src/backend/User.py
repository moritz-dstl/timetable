from flask import Flask, request, jsonify, session, Blueprint
import utils
import requests

# Create a Blueprint for the "User" area
User = Blueprint('User', __name__)

@User.route('/User/register', methods=['POST'])
# creates new database entry in Users without system admin rights
def register_user():
    # Get user data from the request
    new_email = request.json.get('email')
    new_password = request.json.get('password')  # unhashed password
    new_password = utils.hash_password(new_password)  # hash and salt the password
    

    # Check if all required fields are provided
    if all([new_email, new_password]):
        conn = utils.get_db_connection()
        cursor = conn.cursor(buffered=True)  # Use buffered cursor to fetch all results immediately

        # Check if the email is already in use
        email_already_used = utils.check_existing_user(new_email)

        if not email_already_used:
            # Insert new user into the database
            cursor.execute(
                "INSERT INTO Users (email, password) VALUES (%s, %s)",
                (new_email, new_password)
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

    conn = utils.get_db_connection()
    cursor = conn.cursor()

    # Search for user with this email
    cursor.execute("SELECT Uid FROM Users WHERE email = %s", (email,))
    user = cursor.fetchone()

    # Check if user exists and password matches
    if user and utils.check_password(password, email):  # user[1] = password from DB
        session["Uid"] = user[0]
        cursor.close()
        conn.close()

        return jsonify({'message': 'Login success!'}), 200
    else:
        cursor.close()
        conn.close()
        return jsonify({'message': 'Invalid login credentials!'}), 401
    

@User.route('/User/logout', methods=['POST'])
# Clears the current user session
def logout():
    session.clear()
    return jsonify({'message': 'Successfully logged out!'}), 200
