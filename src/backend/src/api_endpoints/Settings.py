from flask import request, jsonify, session, Blueprint
from ..utils import get_db_connection


"""
This module handles the reading and writing of user-specific school configuration data
used for timetable generation. It provides endpoints to store and retrieve settings,
teachers, subjects, and structural school data in a structured format.

Available Routes:
- POST /Settings/set:
  Receives and stores all user-defined settings and school structure data.
  Overwrites existing entries for the given user (UID) in the database.

- GET /Settings/get:
  Returns the currently stored settings, school structure, teachers, and subject
  configuration for the logged-in user.

Functionality:
- On POST, the module receives a JSON payload.
- The data is validated, then persisted to the corresponding relational tables
  (Settings, School, Teachers, TeacherSubjects, Classes, etc.).

- On GET, all relevant data for the current user (identified by session UID)
  is fetched from the database and returned as a single structured JSON object.

Technologies:
- Flask Blueprint for endpoint organization
- MariaDB
- Session-based user identification (UID)
- JSON-based request and response format
"""


Settings = Blueprint('Settings', __name__)

@Settings.route('/Settings/set', methods=['POST'])
def set_settings():
    Uid = session.get('Uid')
    if Uid is None:
        return jsonify({"error": "No UID found in session"}), 403

    data = request.get_json()

    settings_data = data.get('settings', {})
    school_data = data.get('school', {})
    teachers = data.get('teachers', [])
    class_allocations = data.get('class_allocations', [])
    subject_parallel_limits = data.get('subject_parallel_limits', [])
    prefer_block_subjects = data.get('prefer_block_subjects', [])

    required_fields = [
        settings_data.get('prefer_early_hours'),
        settings_data.get('allow_block_scheduling'),
        settings_data.get('max_hours_per_day'),
        settings_data.get('global_break'),
        settings_data.get('weight_block_scheduling'),
        settings_data.get('weight_time_of_hours'),
        settings_data.get('max_time_for_solving'),
        school_data.get('classes'),
        school_data.get('subjects'),
        school_data.get('hours_per_day')
    ]

    if not all(field is not None for field in required_fields):
        return jsonify({"error": "Missing required fields"}), 400

    conn = get_db_connection()
    cursor = conn.cursor(buffered=True)

    # SETTINGS
    cursor.execute("SELECT 1 FROM Settings WHERE Uid = %s", (Uid,))
    if cursor.fetchone():
        cursor.execute("""
            UPDATE Settings SET prefer_early_hours = %s, allow_block_scheduling = %s,
            max_hours_per_day = %s, global_break = %s, weight_block_scheduling = %s, weight_time_of_hours = %s,
            max_time_for_solving = %s WHERE Uid = %s
        """, (
            settings_data['prefer_early_hours'],
            settings_data['allow_block_scheduling'],
            settings_data['max_hours_per_day'],
            settings_data['global_break'],
            settings_data['weight_block_scheduling'],
            settings_data['weight_time_of_hours'],
            settings_data['max_time_for_solving'],
            Uid
        ))
    else:
        cursor.execute("""
            INSERT INTO Settings (Uid, prefer_early_hours, allow_block_scheduling,
            max_hours_per_day, global_break, weight_block_scheduling, weight_time_of_hours, max_time_for_solving)
            VALUES (%s, %s, %s, %s, %s, %s, %s, %s)
        """, (
            Uid,
            settings_data['prefer_early_hours'],
            settings_data['allow_block_scheduling'],
            settings_data['max_hours_per_day'],
            settings_data['global_break'],
            settings_data['weight_block_scheduling'],
            settings_data['weight_time_of_hours'],
            settings_data['max_time_for_solving']
        ))

    # SCHOOL
    cursor.execute("SELECT 1 FROM School WHERE Uid = %s", (Uid,))
    if cursor.fetchone():
        cursor.execute("""
            UPDATE School SET classes = %s, subjects = %s, hours_per_day = %s WHERE Uid = %s
        """, (
            str(school_data['classes']),
            str(school_data['subjects']),
            school_data['hours_per_day'],
            Uid
        ))
    else:
        cursor.execute("""
            INSERT INTO School (Uid, classes, subjects, hours_per_day)
            VALUES (%s, %s, %s, %s)
        """, (
            Uid,
            str(school_data['classes']),
            str(school_data['subjects']),
            school_data['hours_per_day']
        ))

    # TEACHERS
    cursor.execute(
    "DELETE FROM TeacherSubjects WHERE Tid IN "
    "(SELECT Tid FROM Teachers WHERE Uid = %s)",
    (Uid,)
    )
    cursor.execute("DELETE FROM Teachers WHERE Uid = %s", (Uid,))

    # 2) insert the teachers from the payload
    for teacher in teachers:
        name            = teacher.get('name')
        max_hours       = teacher.get('max_hours')
        teacher_subjects = teacher.get('subjects', [])

        # create teacher and grab its primary key
        cursor.execute(
            "INSERT INTO Teachers (Uid, name, max_hours) VALUES (%s, %s, %s) RETURNING Tid",
            (Uid, name, max_hours)
        )
        tid = cursor.fetchone()[0]

        # insert subject qualifications
        for subject in teacher_subjects:
            cursor.execute(
                "INSERT INTO TeacherSubjects (Tid, subject) VALUES (%s, %s)",
                (tid, subject)
            )

    # CLASSES
    cursor.execute("DELETE FROM Classes WHERE Uid = %s", (Uid,))
    for entry in class_allocations:
        class_name = entry.get('class_name')
        subject = entry.get('subject')
        hours_per_week = entry.get('hours_per_week')
        cursor.execute(
            "INSERT INTO Classes (Uid, class_name, subject, hours_per_week) VALUES (%s, %s, %s, %s)",
            (Uid, class_name, subject, hours_per_week)
        )

    # PARALLEL LIMITS
    cursor.execute("DELETE FROM SubjectParallelLimits WHERE Uid = %s", (Uid,))
    for entry in subject_parallel_limits:
        subject_name = entry.get('subject_name')
        max_parallel = entry.get('max_parallel')
        cursor.execute(
            "INSERT INTO SubjectParallelLimits (Uid, subject_name, max_parallel) VALUES (%s, %s, %s)",
            (Uid, subject_name, max_parallel)
        )

    # PREFER BLOCK SUBJECTS
    cursor.execute("DELETE FROM PreferBlockSubjects WHERE Uid = %s", (Uid,))
    for entry in prefer_block_subjects:
        subject_name = entry.get('subject_name')
        weight       = entry.get('weight')
        cursor.execute(
            "INSERT INTO PreferBlockSubjects (Uid, subject_name, weight) VALUES (%s, %s, %s)",
            (Uid, subject_name, weight)
        )

    conn.commit()
    cursor.close()
    conn.close()

    return jsonify({"status": "Settings successfully saved."}), 200



@Settings.route('/Settings/get', methods=['GET'])
def get_settings():
    Uid = session.get('Uid')
    if Uid is None:
        return jsonify({"error": "Not logged in"}), 403

    conn = get_db_connection()
    cursor = conn.cursor(dictionary=True)

    # SETTINGS
    cursor.execute("SELECT * FROM Settings WHERE Uid = %s", (Uid,))
    settings = cursor.fetchone()

    # SCHOOL
    cursor.execute("SELECT * FROM School WHERE Uid = %s", (Uid,))
    school = cursor.fetchone()

    # TEACHERS
    cursor.execute("SELECT Tid, name, max_hours FROM Teachers WHERE Uid = %s", (Uid,))
    teachers = cursor.fetchall()

    # TEACHER SUBJECTS
    cursor.execute(
        "SELECT Tid, subject FROM TeacherSubjects WHERE Tid IN (SELECT Tid FROM Teachers WHERE Uid = %s)",
        (Uid,)
    )
    teacher_subjects = cursor.fetchall()

    # CLASSES
    cursor.execute("SELECT class_name, subject, hours_per_week FROM Classes WHERE Uid = %s", (Uid,))
    class_allocations = cursor.fetchall()

    # SUBJECT PARALLEL LIMITS
    cursor.execute("SELECT subject_name, max_parallel FROM SubjectParallelLimits WHERE Uid = %s", (Uid,))
    subject_limits = cursor.fetchall()

    # PREFER BLOCK SUBJECTS
    cursor.execute("SELECT subject_name, weight FROM PreferBlockSubjects WHERE Uid = %s", (Uid,))
    prefer_block_subjects = cursor.fetchall()

    conn.close()

    return jsonify({
        "settings":               settings or {},
        "school":                 school or {},
        "teachers":               teachers,
        "teacher_subjects":       teacher_subjects,
        "classes":                class_allocations,
        "subject_parallel_limits": subject_limits,
        "prefer_block_subjects":  prefer_block_subjects       
    }), 200
