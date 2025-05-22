from flask import request, jsonify, session, Blueprint
from ortools.sat.python import cp_model
import utils
import traceback
import ast
import logging
import threading, uuid
import time

# Blueprint for the AsyncCompute area
AsyncCompute = Blueprint("AsyncCompute", __name__)

# in-memory storage for job status and results
job_status = {}
job_results = {}

# route to start the computation
@AsyncCompute.route('/start_computing', methods=['GET'])
def start_computing():
    job_id = str(uuid.uuid4())  # Eindeutige ID
    job_status[job_id] = 'running'
    job_results[job_id] = None

    def background_computing(Uid):
        try:
            conn = utils.get_db_connection()
            cursor = conn.cursor()

            # Fetch scheduling preferences for the current user
            cursor.execute("""
                SELECT 
                    prefer_early_hours,
                    allow_block_scheduling,
                    max_hours_per_day,
                    max_consecutive_hours,
                    break_window_start,
                    break_window_end,
                    weight_block_scheduling,
                    weight_time_of_hours,
                    max_time_for_solving
                FROM Settings
                WHERE Uid = %s""", (Uid,))

            settings = cursor.fetchone()
            if not settings:
                job_results[job_id] = {"error": "No settings found for this user."}

            # Fetch restricted parallel subjects (e.g. lab subjects, gym)
            cursor.execute("""
                SELECT subject_name, max_parallel
                FROM SubjectParallelLimits
                WHERE Uid = %s
            """, (Uid,))
            restricted_parallel_subjects = cursor.fetchall()

            # Apply settings
            # activate certain pats of the code based on the settings
            PREFER_EARLY_HOURS = settings[0]
            ALLOW_BLOCK_SCHEDULING = settings[1]

            # Set scheduling parameters
            MAX_HOURS_PER_DAY = settings[2]
            MAX_CONSECUTIVE_HOURS = settings[3]
            BREAK_WINDOW = range(settings[4], settings[5] + 1)

            # Set weights for the soft restrictions
            WEIGHT_BLOCK_SCHEDULING = settings[6]
            WEIGHT_TIME_OF_HOURS = settings[7]

            # Set maximum time for solving the problem
            MAX_TIME_FOR_SOLVING = settings[8]

            # Fetch subjects that strongly prefer block periods
            cursor.execute("""
                SELECT subject_name, weight 
                FROM PreferBlockSubjects
                WHERE Uid = %s
            """, (Uid,))
            PREFER_BLOCK_SUBJECTS = {row[0]: row[1] for row in cursor.fetchall()}

            # Fetch class and subject list from the school data
            cursor.execute("""
                SELECT 
                    classes,
                    subjects,
                    hours_per_day
                FROM School
                WHERE Uid = %s
            """, (Uid,))
            school_data = cursor.fetchone()
            if not school_data:
                job_results[job_id] = {"error": "No school data found for this user."}
            
            # Apply settings
            classes = ast.literal_eval(school_data[0])    # List of classes e.g. ['C1', 'C2', 'C3'] >> converted from string to list
            subjects = ast.literal_eval(school_data[1])   # List of subjects e.g. ['Math', 'English', 'History']    
            hours_per_day = school_data[2]  # Number of hours per day e.g. 8
            days = ['Mo', 'Tu', 'We', 'Th', 'Fr']  # List of days

            school_id = Uid  # Each user manages exactly one school dataset, so Uid == school_id
            subject_indices = {subject: i for i, subject in enumerate(subjects)}

            # Fetch all teachers that belong to the current school
            cursor.execute("SELECT Tid, name, max_hours FROM Teachers WHERE Uid = %s", (school_id,))
            teachers_info = {
                row[0]: {"name": row[1], "max_hours": row[2], "subjects": []}
                for row in cursor.fetchall()
            }
            teacher_ids   = sorted(teachers_info.keys())                      # e.g. [1,2,3,4]
            teacher_names = [teachers_info[tid]["name"] for tid in teacher_ids]  # ["Maier", …]
            teacher_indices = {tid: i for i, tid in enumerate(teacher_ids)}     # {1:0, 2:1, …}

            # Get all teacher IDs
            teacher_ids = tuple(teachers_info.keys())

            # Fetch and assign subjects to each teacher
            if teacher_ids:
                sql = f"""
                    SELECT Tid, subject 
                    FROM TeacherSubjects 
                    WHERE Tid IN ({','.join(['%s'] * len(teacher_ids))})
                """
                cursor.execute(sql, teacher_ids)
                for t_id, subject in cursor.fetchall():
                    teachers_info[t_id]["subjects"].append(subject)


            # Fetch subject-hour assignments for each class at the current school
            cursor.execute("""
                SELECT class_name, subject, hours_per_week
                FROM Classes
                WHERE Uid = %s""", (school_id,))

            # Build a nested dictionary: {class_name: {subject: hours_per_week}}
            class_subject_hours = {}
            for class_name, subject, hours in cursor.fetchall():
                if class_name not in class_subject_hours:
                    class_subject_hours[class_name] = {}
                class_subject_hours[class_name][subject] = hours


            # Close the database connection
            cursor.close()



            # Initialize the model

            model = cp_model.CpModel()  # Create a new CP model

            # Variables
            # schedule: (class, day, hour) -> subject
            # is_occupied: (class, day, hour) -> BoolVar
            schedule = {}
            is_occupied = {}
            objective_terms = []  # List to store terms used in the objective function

            # Build the variable structure for the schedule:
            # For each class, each day, and each hour:
            # - a subject variable (var) is created, which is either a subject index (>= 0) or -1 (free period),
            # - a Boolean variable (occupied) indicating if the slot is used,
            # - both variables are logically linked to ensure consistency.
            for c in classes:  # Iterate over all classes
                for d in range(len(days)):  # Iterate over all days
                    for h in range(hours_per_day):  # Iterate over all hours per day
                        var = model.NewIntVar(-1, len(subjects) - 1, f'{c}_{d}_{h}')  # Subject index or -1 for free period
                        occupied = model.NewBoolVar(f'occupied_{c}_{d}_{h}')  # Occupancy status (True/False)
                        model.Add(var >= 0).OnlyEnforceIf(occupied)  # If occupied, subject index must be valid
                        model.Add(var < 0).OnlyEnforceIf(occupied.Not())  # If not occupied, value must be -1
                        schedule[(c, d, h)] = var  # Store subject variable
                        is_occupied[(c, d, h)] = occupied  # Store occupancy variable

            # preparing the teacher, class and subject mapping
            teacher_schedule = {}  # (class, day, hour) -> teacher index or -1 (no teacher assigned)
            for c in classes:
                for d in range(len(days)):
                    for h in range(hours_per_day):
                        teacher_schedule[(c, d, h)] = model.NewIntVar(-1, len(teachers_info) - 1, f'teacher_{c}_{d}_{h}')



            # Assign a constant teacher to each subject per class
            # This variable determines which teacher will consistently teach the subject in that class
            constant_teacher = {}
            for c in classes:
                for subject in class_subject_hours[c]:
                    constant_teacher[(c, subject)] = model.NewIntVar(0, len(teachers_info) - 1, f'const_teacher_{c}_{subject}')


            # For each class, day, and hour:
            # Check whether a specific subject is scheduled in that slot.
            # If yes, enforce that the assigned teacher matches the pre-assigned (constant) teacher for that subject in that class.
            # Goal: A subject should always be taught by the same teacher in a specific class.

            for c in classes:
                for d in range(len(days)):
                    for h in range(hours_per_day):
                        subject_var = schedule[(c, d, h)]        # The subject scheduled in this time slot
                        teacher_var = teacher_schedule[(c, d, h)]  # The teacher assigned to this time slot

                        for subject in class_subject_hours[c]:  # Only consider subjects scheduled for this class
                            subject_index = subject_indices[subject]  # Get the subject index (e.g., Math = 0, English = 1, ...)
                            is_subject = model.NewBoolVar(f'is_{subject}_{c}_{d}_{h}')  # Bool: Is this subject scheduled here?

                            # If this subject is scheduled here, then is_subject = True
                            model.Add(subject_var == subject_index).OnlyEnforceIf(is_subject)

                            # If another subject is scheduled, then is_subject = False
                            model.Add(subject_var != subject_index).OnlyEnforceIf(is_subject.Not())

                            # If this subject is scheduled, enforce that the correct constant teacher is assigned
                            model.Add(teacher_var == constant_teacher[(c, subject)]).OnlyEnforceIf(is_subject)



            # Each class must have a break if it is scheduled for more than MAX_CONSECUTIVE_HOURS in a day
            for c in classes:
                for d in range(len(days)):
                    # sliding window: any block of (max_consecutive_hours + 1) must contain ≥1 free
                    for start in range(hours_per_day - MAX_CONSECUTIVE_HOURS):
                        window = [
                            is_occupied[(c, d, h)]
                            for h in range(start, start + MAX_CONSECUTIVE_HOURS + 1)
                        ]
                        model.Add(sum(window) <= MAX_CONSECUTIVE_HOURS)
                    # additionally: at least one free slot inside the official break window
                    model.Add(sum(is_occupied[(c, d, h)] for h in BREAK_WINDOW) <= len(BREAK_WINDOW) - 1)



            # Constraint: Teachers need a break if they teach more than MAX_CONSECUTIVE_HOURS in a day.
            # If a teacher teaches too many hours in one day, they must have at least one free period within the defined BREAK_WINDOW.
            for teacher_tid, t_idx in teacher_indices.items():
                for d in range(len(days)):
                    teaches = []      # is_teaching BoolVar for each hour

                    for h in range(hours_per_day):
                        # make a BoolVar per class, OR them to one "is_teaching"
                        teach_in_class = []
                        for c in classes:
                            b = model.NewBoolVar(f"{teacher_tid}_{c}_{d}_{h}")
                            model.Add(teacher_schedule[(c, d, h)] == t_idx).OnlyEnforceIf(b)
                            model.Add(teacher_schedule[(c, d, h)] != t_idx).OnlyEnforceIf(b.Not())
                            teach_in_class.append(b)

                        is_teaching = model.NewBoolVar(f"{teacher_tid}_{d}_{h}_teach")
                        model.AddBoolOr(teach_in_class).OnlyEnforceIf(is_teaching)
                        model.AddBoolAnd([b.Not() for b in teach_in_class]).OnlyEnforceIf(is_teaching.Not())
                        teaches.append(is_teaching)

                    # sliding window: no stretch longer than MAX_CONSECUTIVE_HOURS
                    for start in range(hours_per_day - MAX_CONSECUTIVE_HOURS):
                        window = teaches[start : start + MAX_CONSECUTIVE_HOURS + 1]
                        model.Add(sum(window) <= MAX_CONSECUTIVE_HOURS)

                    # at least one free hour inside BREAK_WINDOW
                    model.Add(sum(teaches[h] for h in BREAK_WINDOW) <= len(BREAK_WINDOW) - 1)




            # Constraint: Limit the number of simultaneous lessons for specific subjects.
            # Background: Some subjects – such as Physical Education or Science – require special rooms
            # (e.g. gymnasium, chemistry lab). These resources are limited.
            # Therefore, a subject may only be taught a limited number of times simultaneously across all classes in any time slot.

            for subject, max_parallel in restricted_parallel_subjects:  # For each subject with a parallel limit
                subject_index = subject_indices[subject]  # Get the index of the subject

                for d in range(len(days)):  
                    for h in range(hours_per_day):  

                        concurrent_subject_slots = []  # Tracks how many times the subject is taught at the same time

                        for c in classes:  # Across all classes
                            is_scheduled = model.NewBoolVar(f'{subject}_{c}_{d}_{h}_concurrent')
                            model.Add(schedule[(c, d, h)] == subject_index).OnlyEnforceIf(is_scheduled)
                            model.Add(schedule[(c, d, h)] != subject_index).OnlyEnforceIf(is_scheduled.Not())
                            concurrent_subject_slots.append(is_scheduled)

                        # Enforce the maximum number of times the subject may be taught concurrently in this slot
                        model.Add(sum(concurrent_subject_slots) <= max_parallel)


            # Add constraints to ensure that each subject in each class
            # appears in the schedule exactly as many times as specified in class_subject_hours.
            # For every time slot, check whether the subject is scheduled.
            # Store this information in a Boolean variable and count them in the end.

            for c in classes:
                for subject, required_count in class_subject_hours[c].items():
                    subject_index = subject_indices[subject]  # Get the subject index (e.g., 'Math' → 0)
                    occurrences = []
                    for d in range(len(days)):
                        for h in range(hours_per_day):
                            is_scheduled = model.NewBoolVar(f'{c}_{subject}_{d}_{h}')  # Bool: is this subject scheduled in this slot?
                            model.Add(schedule[(c, d, h)] == subject_index).OnlyEnforceIf(is_scheduled)
                            model.Add(schedule[(c, d, h)] != subject_index).OnlyEnforceIf(is_scheduled.Not())
                            occurrences.append(is_scheduled)  # Collect for later counting
                    # The subject must be scheduled exactly 'required_count' times per week
                    model.Add(sum(occurrences) == required_count)



            # Constraint: A teacher may only teach subjects they are qualified for.
            # For each time slot, check if a teacher is assigned.
            # If so, ensure that the subject assigned in that slot matches the teacher’s allowed subjects.
            # This is enforced using a Boolean variable `b`, which indicates whether the teacher is teaching in that slot.
            # If `b=True`, then the subject must be one of the teacher's allowed subjects.

            for c in classes:
                for d in range(len(days)):
                    for h in range(hours_per_day):
                        subj_var  = schedule[(c, d, h)]
                        teach_var = teacher_schedule[(c, d, h)]

                        # Create an implication for each teacher:
                        # if teacher t is assigned (b == True) then subj_var must be in t's allowed list.
                        for teacher, info in teachers_info.items():
                            t_idx        = teacher_indices[teacher]
                            allowed_idxs = [subject_indices[s] for s in info["subjects"]]

                            b = model.NewBoolVar(f"{teacher}_{c}_{d}_{h}")
                            model.Add(teach_var == t_idx).OnlyEnforceIf(b)
                            model.Add(teach_var != t_idx).OnlyEnforceIf(b.Not())

                            ok_flags = []
                            for idx in allowed_idxs:
                                ok = model.NewBoolVar(f"{teacher}_{c}_{d}_{h}_ok_{idx}")
                                model.Add(subj_var == idx).OnlyEnforceIf(ok)
                                model.Add(subj_var != idx).OnlyEnforceIf(ok.Not())
                                ok_flags.append(ok)

                            # At least one allowed subject must be true when b is true
                            model.Add(sum(ok_flags) == 1).OnlyEnforceIf(b)


            # Constraints on teacher workload:
            # For each teacher we enforce:
            # - They can teach at most one class in any given time slot,
            # - Their total weekly teaching hours do not exceed their maximum allowed.
            # For each time slot and class, a Boolean variable is created to indicate whether
            # the teacher is teaching there. The sum of these Booleans represents the workload.

            for teacher, t_index in teacher_indices.items():
                assignments = []  # List of all assignments for this teacher across the week

                for d in range(len(days)):  # For each day
                    for h in range(hours_per_day):  # For each hour
                        for c in classes:  # For each class
                            # Boolean variable: Is this teacher assigned to this class at this time?
                            b = model.NewBoolVar(f'{teacher}_assigned_{c}_{d}_{h}')
                            model.Add(teacher_schedule[(c, d, h)] == t_index).OnlyEnforceIf(b)
                            model.Add(teacher_schedule[(c, d, h)] != t_index).OnlyEnforceIf(b.Not())
                            assignments.append(b)

                        # A teacher may only be assigned to one class per time slot
                        model.Add(sum(assignments[-len(classes):]) <= 1)

                # Limit total working hours per week
                model.Add(sum(assignments) <= teachers_info[teacher]['max_hours'])


            # Constraint: If a time slot is not occupied, no teacher should be assigned
            for c in classes:
                for d in range(len(days)):
                    for h in range(hours_per_day):
                        occupied = is_occupied[(c, d, h)]
                        teacher_var = teacher_schedule[(c, d, h)]
                        model.Add(teacher_var == -1).OnlyEnforceIf(occupied.Not())  # No teacher if not occupied
                        model.Add(teacher_var >= 0).OnlyEnforceIf(occupied)         # Valid teacher index if occupied



            # Constraint: Limit how often a subject can be taught per day in a single class.
            # Goal: A subject should appear at most MAX_HOURS_PER_DAY times per day.
            # Example: If MAX_HOURS_PER_DAY = 2, then Math can occur at most twice per day, regardless of continuity.

            for c in classes:  # Iterate over each class
                for subject, _ in class_subject_hours[c].items():  # Only consider subjects assigned to this class
                    subject_index = subject_indices[subject]  # Get the subject index (e.g., "Math" → 0)
                    for d in range(len(days)):  # For each day
                        occurrences = []  # List of slots where this subject occurs on this day
                        for h in range(hours_per_day):  # For each hour in the day
                            b = model.NewBoolVar(f'{c}_{subject}_{d}_{h}_daylimit')
                            # b = True ⇔ this subject is scheduled in this slot
                            model.Add(schedule[(c, d, h)] == subject_index).OnlyEnforceIf(b)
                            model.Add(schedule[(c, d, h)] != subject_index).OnlyEnforceIf(b.Not())
                            occurrences.append(b)
                        # The total number of scheduled hours for this subject on this day must not exceed the limit
                        model.Add(sum(occurrences) <= MAX_HOURS_PER_DAY)




            # All soft contraints follow here:

            # ---------- soft: prefer EARLY periods ---------------------------
            if PREFER_EARLY_HOURS:
                for c in classes:
                    for d in range(len(days)):
                        for h in range(hours_per_day):
                            period_weight = (hours_per_day - h) * WEIGHT_TIME_OF_HOURS
                            objective_terms.append(is_occupied[(c, d, h)] * period_weight)
            # ---------- soft: prefer LATE periods ----------------------------
            else:   # PREFER_EARLY_HOURS == False
                for c in classes:
                    for d in range(len(days)):
                        for h in range(hours_per_day):
                            period_weight = h * WEIGHT_TIME_OF_HOURS
                            objective_terms.append(is_occupied[(c, d, h)] * period_weight)


            # Soft constraint: Prefer double periods – a subject should ideally be scheduled in two consecutive hours.
            # This encourages "block lessons", which are often desirable for subjects like Math or Physical Education.

            if ALLOW_BLOCK_SCHEDULING:
                for c in classes:
                    for subject, _ in class_subject_hours[c].items():
                        subj_idx = subject_indices[subject]
                        # pick weight: global default OR subject-specific bonus
                        weight = PREFER_BLOCK_SUBJECTS.get(subject, WEIGHT_BLOCK_SCHEDULING)
                        for d in range(len(days)):
                            for h in range(hours_per_day - 1):
                                b1 = model.NewBoolVar(f'{c}_{subject}_{d}_{h}_b1')
                                b2 = model.NewBoolVar(f'{c}_{subject}_{d}_{h}_b2')
                                model.Add(schedule[(c, d, h)] == subj_idx).OnlyEnforceIf(b1)
                                model.Add(schedule[(c, d, h)] != subj_idx).OnlyEnforceIf(b1.Not())
                                model.Add(schedule[(c, d, h + 1)] == subj_idx).OnlyEnforceIf(b2)
                                model.Add(schedule[(c, d, h + 1)] != subj_idx).OnlyEnforceIf(b2.Not())

                                both = model.NewBoolVar(f'{c}_{subject}_{d}_{h}_both')
                                model.AddBoolAnd([b1, b2]).OnlyEnforceIf(both)
                                model.AddBoolOr([b1.Not(), b2.Not()]).OnlyEnforceIf(both.Not())

                                objective_terms.append(both * weight)



            # Define the objective function
            model.Maximize(sum(objective_terms))



            # Configure and run the solver
            solver = cp_model.CpSolver()
            solver.parameters.max_time_in_seconds = MAX_TIME_FOR_SOLVING
            solver.parameters.num_search_workers = 3  # Number of CPU cores to use
            # solver.parameters.linearization_level = 0  # Lower complexity (optional)
            # solver.parameters.cp_model_presolve = True  # Use presolve (optional)

            status = solver.Solve(model)

            if status in [cp_model.OPTIMAL, cp_model.FEASIBLE]:
                result = {
                    "status": "success",
                    "classes": {},
                    "teachers": {}
                }

                # ---------- Timetable per class ---------------------------------
                for c in classes:
                    class_timetable = {}
                    for d_index, day in enumerate(days):
                        periods = []
                        for h in range(hours_per_day):
                            subj_idx = solver.Value(schedule[(c, d_index, h)])
                            t_idx    = solver.Value(teacher_schedule[(c, d_index, h)])
                            if subj_idx >= 0 and t_idx >= 0:
                                subject = subjects[subj_idx]
                                teacher = teacher_names[t_idx]         
                                entry   = f"{subject} ({teacher})"
                            else:
                                entry = "free"
                            periods.append(entry)
                        class_timetable[day] = periods
                    result["classes"][c] = class_timetable


                # ---------- Timetable per teacher -------------------------------
                teacher_timetable = {}
                for t_idx, teacher in enumerate(teacher_names):
                    daily = {}
                    for d_index, day in enumerate(days):
                        periods = []
                        for h in range(hours_per_day):
                            entry = "free"
                            for c in classes:
                                if solver.Value(teacher_schedule[(c, d_index, h)]) == t_idx:
                                    subj_idx = solver.Value(schedule[(c, d_index, h)])
                                    subject  = subjects[subj_idx]
                                    entry    = f"{subject} ({c})"
                                    break
                            periods.append(entry)
                        daily[day] = periods
                    teacher_timetable[teacher] = daily
                result["teachers"] = teacher_timetable



                # safe results
                job_results[job_id] = result
                job_status[job_id] = 'finished'

            else:
                job_results[job_id] = {"status": "no_solution"}
                job_status[job_id] = 'finished'

        except Exception as e:
            job_status[job_id] = 'error'
            job_results[job_id] = {
                "error": str(e),
                "traceback": traceback.format_exc()
            }
        finally:
            cursor.close()
            conn.close()



    Uid = session.get('Uid')
    if not Uid:
        job_results[job_id] = {"error": "No user ID found in session."}
    thread = threading.Thread(target=background_computing, args=(Uid,))
    thread.start()

    return jsonify({"job_id": job_id, "status": "started"}), 202

# route to check the status of a job
@AsyncCompute.route('/status/<job_id>', methods=['GET'])
def status(job_id):
    if job_id not in job_status:
        return jsonify({"error": "Unbekannte Job-ID"}), 404

    return jsonify({
        "status": job_status[job_id],
        "result": job_results[job_id] if job_status[job_id] == 'finished' else None
    })
