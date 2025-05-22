from ortools.sat.python import cp_model
from flask import request, jsonify, session, Blueprint
import utils
import ast
import logging

# Create a Blueprint for the timetable compute route
Timetable_compute = Blueprint('Timetable_compute', __name__)


@Timetable_compute.route('/timetable_compute', methods=['GET'])
def timetable_compute_def():
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
        WHERE Uid = %s""", (session.get('Uid'),))

    settings = cursor.fetchone()
    if not settings:
        return jsonify({"error": "No settings found for this user."}), 404

    # Fetch restricted parallel subjects (e.g. lab subjects, gym)
    cursor.execute("""
        SELECT subject_name, max_parallel
        FROM SubjectParallelLimits
        WHERE Uid = %s
    """, (session.get('Uid'),))
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

    # Fetch class and subject list from the school data
    cursor.execute("""
        SELECT 
            classes,
            subjects,
            hours_per_day
        FROM School
        WHERE Uid = %s
    """, (session.get('Uid'),))
    school_data = cursor.fetchone()
    if not school_data:
        return jsonify({"error": "No school data found for this user."}), 404
    
    # Apply settings
    classes = ast.literal_eval(school_data[0])    # List of classes e.g. ['C1', 'C2', 'C3'] >> converted from string to list
    subjects = ast.literal_eval(school_data[1])   # List of subjects e.g. ['Math', 'English', 'History']    
    hours_per_day = school_data[2]  # Number of hours per day e.g. 8
    days = ['Mo', 'Tu', 'We', 'Th', 'Fr']  # List of days

    school_id = session.get('Uid')  # Each user manages exactly one school dataset, so Uid == school_id
    subject_indices = {subject: i for i, subject in enumerate(subjects)}

    # Fetch all teachers that belong to the current school
    cursor.execute("SELECT Tid, name, max_hours FROM Teachers WHERE Uid = %s", (school_id,))
    teachers_info = {
        row[0]: {"name": row[1], "max_hours": row[2], "subjects": []}
        for row in cursor.fetchall()
    }

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
    teacher_indices = {name: i for i, name in enumerate(teachers_info.keys())}
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
            # Count how many hours are occupied on this day
            occupied_slots = [is_occupied[(c, d, h)] for h in range(hours_per_day)]
            total_occupied = model.NewIntVar(0, hours_per_day, f'{c}_{d}_total_occupied')
            model.Add(total_occupied == sum(occupied_slots))  # Total occupied slots for the day

            # Check if there is at least one free slot in the break window
            break_conditions = []  # List of conditions where a slot in the break window is free
            for h in BREAK_WINDOW:
                is_free = model.NewBoolVar(f'{c}_{d}_{h}_is_free')
                model.Add(is_occupied[(c, d, h)] == 0).OnlyEnforceIf(is_free)
                model.Add(is_occupied[(c, d, h)] == 1).OnlyEnforceIf(is_free.Not())
                break_conditions.append(is_free)

            # Variable: Is there a break in the break window?
            has_break = model.NewBoolVar(f'{c}_{d}_has_break')
            model.AddBoolOr(break_conditions).OnlyEnforceIf(has_break)
            model.AddBoolAnd([b.Not() for b in break_conditions]).OnlyEnforceIf(has_break.Not())

            # Variable: Does the class actually need a break on this day?
            needs_break = model.NewBoolVar(f'{c}_{d}_needs_break')
            model.Add(total_occupied > MAX_CONSECUTIVE_HOURS).OnlyEnforceIf(needs_break)
            model.Add(total_occupied <= MAX_CONSECUTIVE_HOURS).OnlyEnforceIf(needs_break.Not())

            # If a break is needed, then there must be at least one free period in the break window
            model.Add(has_break == 1).OnlyEnforceIf(needs_break)



    # Constraint: Teachers need a break if they teach more than MAX_CONSECUTIVE_HOURS in a day.
    # If a teacher teaches too many hours in one day, they must have at least one free period within the defined BREAK_WINDOW.
    for teacher, t_index in teacher_indices.items():  # Iterate over all teachers
        for d in range(len(days)):  # For each day
            teaching_slots = []  # All time slots where the teacher is teaching

            for h in range(hours_per_day):  # For each hour of the day
                is_teaching = model.NewBoolVar(f'{teacher}_{d}_{h}_teaching')

                # A teacher is considered to be teaching in this hour if they teach in at least one class
                teaching_in_class = []
                for c in classes:
                    in_class = model.NewBoolVar(f'{teacher}_{d}_{h}_in_{c}')
                    model.Add(teacher_schedule[(c, d, h)] == t_index).OnlyEnforceIf(in_class)
                    model.Add(teacher_schedule[(c, d, h)] != t_index).OnlyEnforceIf(in_class.Not())
                    teaching_in_class.append(in_class)

                model.AddBoolOr(teaching_in_class).OnlyEnforceIf(is_teaching)
                model.AddBoolAnd([i.Not() for i in teaching_in_class]).OnlyEnforceIf(is_teaching.Not())

                teaching_slots.append(is_teaching)

            # Count the total number of hours the teacher is teaching on this day
            total_teaching = model.NewIntVar(0, hours_per_day, f'{teacher}_{d}_total')
            model.Add(total_teaching == sum(teaching_slots))

            # Check if there is at least one free period in the break window
            has_break_conditions = []
            for h in BREAK_WINDOW:
                is_free = model.NewBoolVar(f'{teacher}_{d}_{h}_is_free')

                not_teaching_in_classes = []
                for c in classes:
                    not_in = model.NewBoolVar(f'{teacher}_{d}_{h}_not_in_{c}')
                    model.Add(teacher_schedule[(c, d, h)] != t_index).OnlyEnforceIf(not_in)
                    model.Add(teacher_schedule[(c, d, h)] == t_index).OnlyEnforceIf(not_in.Not())
                    not_teaching_in_classes.append(not_in)

                # The teacher is free if they are not teaching in any class at this time
                model.AddBoolAnd(not_teaching_in_classes).OnlyEnforceIf(is_free)
                model.AddBoolOr([ni.Not() for ni in not_teaching_in_classes]).OnlyEnforceIf(is_free.Not())

                has_break_conditions.append(is_free)

            # Variable: Does the teacher have a break in the break window?
            has_break = model.NewBoolVar(f'{teacher}_{d}_has_break')
            model.AddBoolOr(has_break_conditions).OnlyEnforceIf(has_break)

            # Variable: Does the teacher need a break today?
            needs_break = model.NewBoolVar(f'{teacher}_{d}_needs_break')
            model.Add(total_teaching > MAX_CONSECUTIVE_HOURS).OnlyEnforceIf(needs_break)
            model.Add(total_teaching <= MAX_CONSECUTIVE_HOURS).OnlyEnforceIf(needs_break.Not())

            # If a break is needed, then there must be a free period in the break window
            model.Add(has_break == 1).OnlyEnforceIf(needs_break)



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
                subject_var = schedule[(c, d, h)]      # Subject taught in this time slot
                teacher_var = teacher_schedule[(c, d, h)]  # Teacher assigned to this slot

                for teacher, info in teachers_info.items():
                    teacher_index = teacher_indices[teacher]  # Index of this teacher
                    allowed_subjects = [subject_indices[subj] for subj in info['subjects']]  # Subjects the teacher can teach

                    # Boolean variable: Is this teacher assigned in this slot?
                    b = model.NewBoolVar(f'teacher_{teacher}_{c}_{d}_{h}')
                    model.Add(teacher_var == teacher_index).OnlyEnforceIf(b)
                    model.Add(teacher_var != teacher_index).OnlyEnforceIf(b.Not())

                    # If the teacher is assigned, the subject must be one they are qualified to teach
                    model.AddAllowedAssignments([subject_var], [[s] for s in allowed_subjects]).OnlyEnforceIf(b)



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

    # Soft constraint: Prefer early hours – classes earlier in the day are considered more desirable.
    # Goal: Schedule as many lessons as possible in the morning hours (e.g., 1st to 3rd period).
    # The earlier a scheduled class, the higher the contribution to the objective function.

    if PREFER_EARLY_HOURS is True:
        for c in classes:  # For each class
            for d in range(len(days)):  # For each day
                for h in range(hours_per_day):  # For each hour in the day
                    weight = hours_per_day - h  # Earlier hours get higher weight (e.g., 8-0 = 8, 8-7 = 1)
                    objective_terms.append(is_occupied[(c, d, h)] * weight)


    # Soft constraint: Prefer late hours – classes later in the day are considered more desirable.
    # This can help better utilize late-day periods like 6th, 7th, or 8th hour.
    # Each scheduled class contributes more to the objective the later it occurs in the day.

    if PREFER_EARLY_HOURS is False:
        for c in classes:  # For each class
            for d in range(len(days)):  # For each day
                for h in range(hours_per_day):  # For each hour in the day
                    weight = h  # Later hours get higher weight (e.g., 0 = early, 7 = late)
                    objective_terms.append(is_occupied[(c, d, h)] * weight)


    # Soft constraint: Prefer double periods – a subject should ideally be scheduled in two consecutive hours.
    # This encourages "block lessons", which are often desirable for subjects like Math or Physical Education.

    if ALLOW_BLOCK_SCHEDULING:
        subject_block_bonus = []  # List to collect all detected subject blocks for use in the objective function

        for c in classes:  # Iterate over all classes
            for subject, _ in class_subject_hours[c].items():  # Only subjects taught in this class
                subject_index = subject_indices[subject]  # Get the index of the subject
                for d in range(len(days)):  # For each weekday
                    for h in range(hours_per_day - 1):  # Compare every hour with the next (h and h+1)

                        # Create BoolVars: is the subject scheduled at hour h and h+1?
                        b1 = model.NewBoolVar(f'{c}_{subject}_{d}_{h}_block1')
                        b2 = model.NewBoolVar(f'{c}_{subject}_{d}_{h}_block2')

                        # b1 is True if the subject is scheduled at hour h
                        model.Add(schedule[(c, d, h)] == subject_index).OnlyEnforceIf(b1)
                        model.Add(schedule[(c, d, h)] != subject_index).OnlyEnforceIf(b1.Not())

                        # b2 is True if the subject is scheduled at hour h+1
                        model.Add(schedule[(c, d, h + 1)] == subject_index).OnlyEnforceIf(b2)
                        model.Add(schedule[(c, d, h + 1)] != subject_index).OnlyEnforceIf(b2.Not())

                        # Both is True only if b1 and b2 are both True → indicates a double period
                        both = model.NewBoolVar(f'{c}_{subject}_{d}_{h}_both')
                        model.AddBoolAnd([b1, b2]).OnlyEnforceIf(both)
                        model.AddBoolOr([b1.Not(), b2.Not()]).OnlyEnforceIf(both.Not())

                        # Add to the bonus list and the objective function
                        subject_block_bonus.append(both)
                        objective_terms.append(both * WEIGHT_BLOCK_SCHEDULING)


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
        # Output the schedule per class with subject and teacher
        for c in classes:
            logging.info(f"\nSchedule for class {c}:")
            for d_index, day in enumerate(days):
                periods = []
                for h in range(hours_per_day):
                    subject_index = solver.Value(schedule[(c, d_index, h)])
                    teacher_index = solver.Value(teacher_schedule[(c, d_index, h)])
                    if subject_index >= 0 and teacher_index >= 0:
                        subject = subjects[subject_index]
                        teacher = list(teachers_info.keys())[teacher_index]
                        entry = f"{subject} ({teacher})"
                    else:
                        entry = "free"
                    periods.append(entry)
                logging.info(f"{day}: {', '.join(periods)}")

        # Output the schedule per teacher with subject and class
        teacher_names = list(teachers_info.keys())
        for teacher_index, teacher in enumerate(teacher_names):
            logging.info(f"\nSchedule for teacher {teacher}:")
            for d_index, day in enumerate(days):
                periods = []
                for h in range(hours_per_day):
                    entry = "free"
                    for c in classes:
                        if solver.Value(teacher_schedule[(c, d_index, h)]) == teacher_index:
                            subject_index = solver.Value(schedule[(c, d_index, h)])
                            subject = subjects[subject_index]
                            entry = f"{subject} ({c})"
                            break  # A teacher can only be in one class per slot
                    periods.append(entry)
                logging.info(f"{day}: {', '.join(periods)}")

        # Return AFTER all logging
        return jsonify({'message': 'Successfully computed!'}), 200

    else:
        logging.warning("No solution found.")
        return jsonify({'message': 'No solution found!'}), 422