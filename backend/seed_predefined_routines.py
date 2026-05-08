"""
Seed predefined routines and exercises into Firestore.
Idempotent — safe to run multiple times.
Uses fixed document IDs so re-runs just overwrite with the same data.
"""
import os, sys
sys.path.insert(0, os.path.dirname(__file__))

import firebase_admin
from firebase_admin import credentials, firestore

# ── Firebase init ──────────────────────────────────────────────────────────────
KEY_PATH = os.path.join(os.path.dirname(__file__), "serviceAccountKey.json")
if not firebase_admin._apps:
    cred = credentials.Certificate(KEY_PATH)
    firebase_admin.initialize_app(cred)

db = firestore.client()

# ── Exercise definitions ───────────────────────────────────────────────────────
# Using fixed IDs (prefixed "sys_ex_") so the script is idempotent.
EXERCISES = [
    # Chest
    {"id": "sys_ex_bench_press",       "name": "Bench Press",            "muscle_group": "Chest",    "description": "Barbell flat bench press. Primary pec builder.", "type": "strength"},
    {"id": "sys_ex_incline_bench",     "name": "Incline Bench Press",    "muscle_group": "Chest",    "description": "Barbell/dumbbell press on inclined bench. Targets upper pecs.", "type": "strength"},
    {"id": "sys_ex_cable_flyes",       "name": "Cable Flyes",            "muscle_group": "Chest",    "description": "Cable crossover. Constant tension throughout the range.", "type": "strength"},
    {"id": "sys_ex_push_ups",          "name": "Push-Ups",               "muscle_group": "Chest",    "description": "Bodyweight push-up. Chest, shoulders and triceps.", "type": "bodyweight"},
    {"id": "sys_ex_dips",              "name": "Dips",                   "muscle_group": "Chest",    "description": "Parallel bar dips. Lean forward to bias chest.", "type": "bodyweight"},
    # Back
    {"id": "sys_ex_pull_ups",          "name": "Pull-Ups",               "muscle_group": "Back",     "description": "Pronated-grip pull-up. Lat width builder.", "type": "bodyweight"},
    {"id": "sys_ex_barbell_row",       "name": "Barbell Row",            "muscle_group": "Back",     "description": "Bent-over barbell row. Mid-back thickness.", "type": "strength"},
    {"id": "sys_ex_seated_cable_row",  "name": "Seated Cable Row",       "muscle_group": "Back",     "description": "Cable row with neutral grip. Rhomboids and mid-traps.", "type": "strength"},
    {"id": "sys_ex_lat_pulldown",      "name": "Lat Pulldown",           "muscle_group": "Back",     "description": "Wide-grip pulldown. Great for lat width.", "type": "strength"},
    {"id": "sys_ex_face_pulls",        "name": "Face Pulls",             "muscle_group": "Back",     "description": "Cable face pull. Rear delts and external rotators.", "type": "strength"},
    {"id": "sys_ex_deadlift",          "name": "Deadlift",               "muscle_group": "Back",     "description": "Conventional deadlift. King of all posterior-chain exercises.", "type": "strength"},
    # Shoulders
    {"id": "sys_ex_ohp",               "name": "Overhead Press",         "muscle_group": "Shoulders","description": "Standing barbell press. Full shoulder development.", "type": "strength"},
    {"id": "sys_ex_lateral_raises",    "name": "Lateral Raises",         "muscle_group": "Shoulders","description": "Dumbbell lateral raise. Medial delt isolation.", "type": "strength"},
    {"id": "sys_ex_front_raises",      "name": "Front Raises",           "muscle_group": "Shoulders","description": "Dumbbell or plate front raise. Anterior delt.", "type": "strength"},
    {"id": "sys_ex_rear_delt_flyes",   "name": "Rear Delt Flyes",        "muscle_group": "Shoulders","description": "Bent-over dumbbell flyes. Posterior delt.", "type": "strength"},
    # Biceps
    {"id": "sys_ex_barbell_curl",      "name": "Barbell Curl",           "muscle_group": "Biceps",   "description": "Standing barbell curl. Maximum bicep loading.", "type": "strength"},
    {"id": "sys_ex_hammer_curl",       "name": "Hammer Curl",            "muscle_group": "Biceps",   "description": "Neutral-grip dumbbell curl. Brachialis and brachioradialis.", "type": "strength"},
    {"id": "sys_ex_incline_db_curl",   "name": "Incline Dumbbell Curl",  "muscle_group": "Biceps",   "description": "Seated incline dumbbell curl. Full bicep stretch.", "type": "strength"},
    # Triceps
    {"id": "sys_ex_pushdown",          "name": "Tricep Pushdown",        "muscle_group": "Triceps",  "description": "Cable pushdown with rope or bar. Lateral head focus.", "type": "strength"},
    {"id": "sys_ex_overhead_tricep",   "name": "Overhead Tricep Extension","muscle_group": "Triceps","description": "Dumbbell or cable overhead extension. Long head stretch.", "type": "strength"},
    {"id": "sys_ex_cgbp",              "name": "Close-Grip Bench Press", "muscle_group": "Triceps",  "description": "Narrow grip bench. Compound tricep movement.", "type": "strength"},
    # Legs
    {"id": "sys_ex_squat",             "name": "Barbell Squat",          "muscle_group": "Legs",     "description": "High-bar back squat. Best overall quad developer.", "type": "strength"},
    {"id": "sys_ex_rdl",               "name": "Romanian Deadlift",      "muscle_group": "Legs",     "description": "RDL. Hamstring and glute focus with hip hinge.", "type": "strength"},
    {"id": "sys_ex_leg_press",         "name": "Leg Press",              "muscle_group": "Legs",     "description": "45-degree leg press. Quad-dominant leg exercise.", "type": "strength"},
    {"id": "sys_ex_leg_curl",          "name": "Leg Curl",               "muscle_group": "Legs",     "description": "Lying or seated leg curl. Hamstring isolation.", "type": "strength"},
    {"id": "sys_ex_calf_raises",       "name": "Calf Raises",            "muscle_group": "Legs",     "description": "Standing calf raise. Gastrocnemius development.", "type": "strength"},
    {"id": "sys_ex_lunges",            "name": "Lunges",                 "muscle_group": "Legs",     "description": "Walking or stationary lunges. Unilateral leg work.", "type": "strength"},
    {"id": "sys_ex_hip_thrust",        "name": "Hip Thrust",             "muscle_group": "Legs",     "description": "Barbell hip thrust. Glute maximus peak contraction.", "type": "strength"},
    # Core
    {"id": "sys_ex_plank",             "name": "Plank",                  "muscle_group": "Core",     "description": "Isometric core hold. Anti-extension stability.", "type": "bodyweight"},
    {"id": "sys_ex_crunches",          "name": "Crunches",               "muscle_group": "Core",     "description": "Floor crunch. Rectus abdominis isolation.", "type": "bodyweight"},
    {"id": "sys_ex_russian_twist",     "name": "Russian Twist",          "muscle_group": "Core",     "description": "Seated rotational ab exercise. Obliques.", "type": "bodyweight"},
]

# ── Routine definitions ────────────────────────────────────────────────────────
# day_of_week: 1=Monday ... 7=Sunday
# Each exercise: (exercise_id, sets, reps_min, reps_max, order)

PREDEFINED_ROUTINES = [
    # ── BEGINNER ────────────────────────────────────────────────────────────────
    {
        "id": "sys_routine_beginner",
        "name": "Full Body Starter",
        "description": "3-day full body program for beginners. Trains all major muscle groups every session with compound movements. Perfect first routine.",
        "difficulty": "beginner",
        "days_per_week": 3,
        "exercises": [
            # Monday – Full Body A
            {"exercise_id": "sys_ex_squat",          "day": 1, "sets": 3, "reps_min": 8,  "reps_max": 10, "order": 0},
            {"exercise_id": "sys_ex_bench_press",    "day": 1, "sets": 3, "reps_min": 8,  "reps_max": 10, "order": 1},
            {"exercise_id": "sys_ex_barbell_row",    "day": 1, "sets": 3, "reps_min": 8,  "reps_max": 10, "order": 2},
            {"exercise_id": "sys_ex_ohp",            "day": 1, "sets": 3, "reps_min": 10, "reps_max": 12, "order": 3},
            {"exercise_id": "sys_ex_plank",          "day": 1, "sets": 3, "reps_min": 30, "reps_max": 45, "order": 4},
            # Wednesday – Full Body B
            {"exercise_id": "sys_ex_leg_press",      "day": 3, "sets": 3, "reps_min": 10, "reps_max": 12, "order": 0},
            {"exercise_id": "sys_ex_incline_bench",  "day": 3, "sets": 3, "reps_min": 10, "reps_max": 12, "order": 1},
            {"exercise_id": "sys_ex_lat_pulldown",   "day": 3, "sets": 3, "reps_min": 10, "reps_max": 12, "order": 2},
            {"exercise_id": "sys_ex_lateral_raises", "day": 3, "sets": 3, "reps_min": 12, "reps_max": 15, "order": 3},
            {"exercise_id": "sys_ex_crunches",       "day": 3, "sets": 3, "reps_min": 15, "reps_max": 20, "order": 4},
            # Friday – Full Body C
            {"exercise_id": "sys_ex_rdl",            "day": 5, "sets": 3, "reps_min": 8,  "reps_max": 10, "order": 0},
            {"exercise_id": "sys_ex_push_ups",       "day": 5, "sets": 3, "reps_min": 12, "reps_max": 15, "order": 1},
            {"exercise_id": "sys_ex_seated_cable_row","day": 5, "sets": 3, "reps_min": 10, "reps_max": 12, "order": 2},
            {"exercise_id": "sys_ex_barbell_curl",   "day": 5, "sets": 3, "reps_min": 12, "reps_max": 15, "order": 3},
            {"exercise_id": "sys_ex_lunges",         "day": 5, "sets": 3, "reps_min": 10, "reps_max": 12, "order": 4},
        ],
    },

    # ── INTERMEDIATE ─────────────────────────────────────────────────────────────
    {
        "id": "sys_routine_intermediate",
        "name": "Push / Pull / Legs",
        "description": "Classic 6-day PPL split for intermediate lifters. Hits each muscle group twice a week with optimal volume and frequency.",
        "difficulty": "intermediate",
        "days_per_week": 6,
        "exercises": [
            # Monday – Push A
            {"exercise_id": "sys_ex_bench_press",       "day": 1, "sets": 4, "reps_min": 8,  "reps_max": 10, "order": 0},
            {"exercise_id": "sys_ex_incline_bench",     "day": 1, "sets": 3, "reps_min": 10, "reps_max": 12, "order": 1},
            {"exercise_id": "sys_ex_ohp",               "day": 1, "sets": 4, "reps_min": 8,  "reps_max": 10, "order": 2},
            {"exercise_id": "sys_ex_lateral_raises",    "day": 1, "sets": 3, "reps_min": 12, "reps_max": 15, "order": 3},
            {"exercise_id": "sys_ex_pushdown",          "day": 1, "sets": 3, "reps_min": 12, "reps_max": 15, "order": 4},
            {"exercise_id": "sys_ex_overhead_tricep",   "day": 1, "sets": 3, "reps_min": 10, "reps_max": 12, "order": 5},
            # Tuesday – Pull A
            {"exercise_id": "sys_ex_pull_ups",          "day": 2, "sets": 4, "reps_min": 6,  "reps_max": 10, "order": 0},
            {"exercise_id": "sys_ex_barbell_row",       "day": 2, "sets": 4, "reps_min": 8,  "reps_max": 10, "order": 1},
            {"exercise_id": "sys_ex_lat_pulldown",      "day": 2, "sets": 3, "reps_min": 10, "reps_max": 12, "order": 2},
            {"exercise_id": "sys_ex_face_pulls",        "day": 2, "sets": 3, "reps_min": 15, "reps_max": 20, "order": 3},
            {"exercise_id": "sys_ex_barbell_curl",      "day": 2, "sets": 3, "reps_min": 10, "reps_max": 12, "order": 4},
            {"exercise_id": "sys_ex_hammer_curl",       "day": 2, "sets": 3, "reps_min": 12, "reps_max": 15, "order": 5},
            # Wednesday – Legs A
            {"exercise_id": "sys_ex_squat",             "day": 3, "sets": 4, "reps_min": 6,  "reps_max": 8,  "order": 0},
            {"exercise_id": "sys_ex_rdl",               "day": 3, "sets": 3, "reps_min": 8,  "reps_max": 10, "order": 1},
            {"exercise_id": "sys_ex_leg_press",         "day": 3, "sets": 3, "reps_min": 10, "reps_max": 12, "order": 2},
            {"exercise_id": "sys_ex_leg_curl",          "day": 3, "sets": 3, "reps_min": 12, "reps_max": 15, "order": 3},
            {"exercise_id": "sys_ex_hip_thrust",        "day": 3, "sets": 3, "reps_min": 10, "reps_max": 12, "order": 4},
            {"exercise_id": "sys_ex_calf_raises",       "day": 3, "sets": 4, "reps_min": 15, "reps_max": 20, "order": 5},
            # Thursday – Push B
            {"exercise_id": "sys_ex_incline_bench",     "day": 4, "sets": 4, "reps_min": 8,  "reps_max": 10, "order": 0},
            {"exercise_id": "sys_ex_cable_flyes",       "day": 4, "sets": 3, "reps_min": 12, "reps_max": 15, "order": 1},
            {"exercise_id": "sys_ex_ohp",               "day": 4, "sets": 3, "reps_min": 10, "reps_max": 12, "order": 2},
            {"exercise_id": "sys_ex_rear_delt_flyes",   "day": 4, "sets": 3, "reps_min": 15, "reps_max": 20, "order": 3},
            {"exercise_id": "sys_ex_cgbp",              "day": 4, "sets": 3, "reps_min": 10, "reps_max": 12, "order": 4},
            {"exercise_id": "sys_ex_dips",              "day": 4, "sets": 3, "reps_min": 10, "reps_max": 15, "order": 5},
            # Friday – Pull B
            {"exercise_id": "sys_ex_deadlift",          "day": 5, "sets": 3, "reps_min": 5,  "reps_max": 6,  "order": 0},
            {"exercise_id": "sys_ex_seated_cable_row",  "day": 5, "sets": 4, "reps_min": 10, "reps_max": 12, "order": 1},
            {"exercise_id": "sys_ex_lat_pulldown",      "day": 5, "sets": 3, "reps_min": 10, "reps_max": 12, "order": 2},
            {"exercise_id": "sys_ex_face_pulls",        "day": 5, "sets": 3, "reps_min": 15, "reps_max": 20, "order": 3},
            {"exercise_id": "sys_ex_incline_db_curl",   "day": 5, "sets": 3, "reps_min": 10, "reps_max": 12, "order": 4},
            {"exercise_id": "sys_ex_hammer_curl",       "day": 5, "sets": 3, "reps_min": 12, "reps_max": 15, "order": 5},
            # Saturday – Legs B
            {"exercise_id": "sys_ex_squat",             "day": 6, "sets": 4, "reps_min": 8,  "reps_max": 10, "order": 0},
            {"exercise_id": "sys_ex_leg_press",         "day": 6, "sets": 4, "reps_min": 10, "reps_max": 12, "order": 1},
            {"exercise_id": "sys_ex_lunges",            "day": 6, "sets": 3, "reps_min": 10, "reps_max": 12, "order": 2},
            {"exercise_id": "sys_ex_leg_curl",          "day": 6, "sets": 3, "reps_min": 12, "reps_max": 15, "order": 3},
            {"exercise_id": "sys_ex_hip_thrust",        "day": 6, "sets": 4, "reps_min": 10, "reps_max": 12, "order": 4},
            {"exercise_id": "sys_ex_calf_raises",       "day": 6, "sets": 5, "reps_min": 15, "reps_max": 20, "order": 5},
        ],
    },

    # ── ADVANCED ─────────────────────────────────────────────────────────────────
    {
        "id": "sys_routine_advanced",
        "name": "Powerbuilding 5-Day",
        "description": "5-day bodypart split combining strength (5x5 compounds) with hypertrophy work. For experienced lifters seeking size and strength gains.",
        "difficulty": "advanced",
        "days_per_week": 5,
        "exercises": [
            # Monday – Chest
            {"exercise_id": "sys_ex_bench_press",     "day": 1, "sets": 5, "reps_min": 4,  "reps_max": 6,  "order": 0},
            {"exercise_id": "sys_ex_incline_bench",   "day": 1, "sets": 4, "reps_min": 8,  "reps_max": 10, "order": 1},
            {"exercise_id": "sys_ex_cable_flyes",     "day": 1, "sets": 4, "reps_min": 12, "reps_max": 15, "order": 2},
            {"exercise_id": "sys_ex_dips",            "day": 1, "sets": 3, "reps_min": 10, "reps_max": 15, "order": 3},
            {"exercise_id": "sys_ex_push_ups",        "day": 1, "sets": 3, "reps_min": 15, "reps_max": 20, "order": 4},
            # Tuesday – Back
            {"exercise_id": "sys_ex_deadlift",        "day": 2, "sets": 5, "reps_min": 3,  "reps_max": 5,  "order": 0},
            {"exercise_id": "sys_ex_pull_ups",        "day": 2, "sets": 4, "reps_min": 6,  "reps_max": 10, "order": 1},
            {"exercise_id": "sys_ex_barbell_row",     "day": 2, "sets": 4, "reps_min": 6,  "reps_max": 8,  "order": 2},
            {"exercise_id": "sys_ex_seated_cable_row","day": 2, "sets": 3, "reps_min": 10, "reps_max": 12, "order": 3},
            {"exercise_id": "sys_ex_face_pulls",      "day": 2, "sets": 4, "reps_min": 15, "reps_max": 20, "order": 4},
            # Wednesday – Shoulders + Arms
            {"exercise_id": "sys_ex_ohp",             "day": 3, "sets": 5, "reps_min": 4,  "reps_max": 6,  "order": 0},
            {"exercise_id": "sys_ex_lateral_raises",  "day": 3, "sets": 4, "reps_min": 12, "reps_max": 15, "order": 1},
            {"exercise_id": "sys_ex_front_raises",    "day": 3, "sets": 3, "reps_min": 12, "reps_max": 15, "order": 2},
            {"exercise_id": "sys_ex_rear_delt_flyes", "day": 3, "sets": 4, "reps_min": 15, "reps_max": 20, "order": 3},
            {"exercise_id": "sys_ex_barbell_curl",    "day": 3, "sets": 4, "reps_min": 8,  "reps_max": 10, "order": 4},
            {"exercise_id": "sys_ex_incline_db_curl", "day": 3, "sets": 3, "reps_min": 10, "reps_max": 12, "order": 5},
            {"exercise_id": "sys_ex_pushdown",        "day": 3, "sets": 4, "reps_min": 10, "reps_max": 12, "order": 6},
            {"exercise_id": "sys_ex_overhead_tricep", "day": 3, "sets": 3, "reps_min": 10, "reps_max": 12, "order": 7},
            # Thursday – Legs
            {"exercise_id": "sys_ex_squat",           "day": 4, "sets": 5, "reps_min": 4,  "reps_max": 6,  "order": 0},
            {"exercise_id": "sys_ex_rdl",             "day": 4, "sets": 4, "reps_min": 6,  "reps_max": 8,  "order": 1},
            {"exercise_id": "sys_ex_leg_press",       "day": 4, "sets": 4, "reps_min": 10, "reps_max": 12, "order": 2},
            {"exercise_id": "sys_ex_leg_curl",        "day": 4, "sets": 4, "reps_min": 12, "reps_max": 15, "order": 3},
            {"exercise_id": "sys_ex_hip_thrust",      "day": 4, "sets": 4, "reps_min": 8,  "reps_max": 10, "order": 4},
            {"exercise_id": "sys_ex_lunges",          "day": 4, "sets": 3, "reps_min": 10, "reps_max": 12, "order": 5},
            {"exercise_id": "sys_ex_calf_raises",     "day": 4, "sets": 5, "reps_min": 15, "reps_max": 20, "order": 6},
            # Friday – Power Full Body
            {"exercise_id": "sys_ex_squat",           "day": 5, "sets": 3, "reps_min": 3,  "reps_max": 3,  "order": 0},
            {"exercise_id": "sys_ex_bench_press",     "day": 5, "sets": 3, "reps_min": 3,  "reps_max": 3,  "order": 1},
            {"exercise_id": "sys_ex_deadlift",        "day": 5, "sets": 3, "reps_min": 2,  "reps_max": 3,  "order": 2},
            {"exercise_id": "sys_ex_ohp",             "day": 5, "sets": 3, "reps_min": 5,  "reps_max": 5,  "order": 3},
            {"exercise_id": "sys_ex_pull_ups",        "day": 5, "sets": 3, "reps_min": 8,  "reps_max": 10, "order": 4},
            {"exercise_id": "sys_ex_russian_twist",   "day": 5, "sets": 3, "reps_min": 20, "reps_max": 20, "order": 5},
        ],
    },
]


def seed():
    print("Seeding exercises...")
    for ex in EXERCISES:
        doc_id = ex.pop("id")
        db.collection("exercises").document(doc_id).set(ex)
        ex["id"] = doc_id  # restore for later reference
        print(f"  ✓ {ex['name']}")

    print("\nSeeding predefined routines...")
    from datetime import datetime

    for routine_def in PREDEFINED_ROUTINES:
        routine_id = routine_def["id"]
        exercises  = routine_def.pop("exercises")

        # Routine document (do NOT store 'id' as a field — it's the document ID)
        routine_data = {
            "name":         routine_def["name"],
            "description":  routine_def["description"],
            "difficulty":   routine_def["difficulty"],
            "days_per_week": routine_def["days_per_week"],
            "creator_id":   "system",
            "is_public":    True,
            "is_predefined": True,
            "average_rating": 0.0,
            "rating_count": 0,
            "created_at":   datetime.utcnow().isoformat(),
        }
        db.collection("routines").document(routine_id).set(routine_data)
        routine_def["exercises"] = exercises  # restore
        print(f"  ✓ Routine: {routine_def['name']}")

        # Delete existing exercises for this routine (idempotency)
        old_exs = db.collection("routine_exercises") \
                    .where("routine_id", "==", routine_id).stream()
        old_batch = db.batch()
        for doc in old_exs:
            old_batch.delete(doc.reference)
        old_batch.commit()

        # Create exercises in batches of 500
        batch = db.batch()
        for i, ex in enumerate(exercises):
            ex_doc = db.collection("routine_exercises").document(
                f"{routine_id}_day{ex['day']}_ex{ex['order']}"
            )
            batch.set(ex_doc, {
                "routine_id":     routine_id,
                "exercise_id":    ex["exercise_id"],
                "day_of_week":    ex["day"],
                "order_index":    ex["order"],
                "target_sets":    ex["sets"],
                "target_reps_min": ex["reps_min"],
                "target_reps_max": ex["reps_max"],
                "reps_display": f"{ex['reps_min']}-{ex['reps_max']}" if ex["reps_min"] != ex["reps_max"] else str(ex["reps_min"]),
            })
        batch.commit()
        print(f"    → {len(exercises)} exercise slots written")

    print("\nDone.")


if __name__ == "__main__":
    seed()
