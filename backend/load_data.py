"""
Blood Bridge AI — Load All Data into DynamoDB
Run: python load_data.py
Requirements: pip install boto3 pandas
"""

import boto3
import pandas as pd
import uuid
import json
import hashlib
import random
from datetime import datetime, timedelta
from decimal import Decimal

# ── Config ────────────────────────────────────────────────────────────────────
AWS_REGION   = "us-east-1"
CSV_FILE     = "Dataset.csv"
BATCH_SIZE   = 25  # DynamoDB batch write limit

dynamodb     = boto3.resource("dynamodb", region_name=AWS_REGION)
users_table  = dynamodb.Table("Users")
requests_table = dynamodb.Table("BloodRequests")
cycles_table = dynamodb.Table("TransfusionCycles")
matches_table = dynamodb.Table("DonorMatches")
notif_table  = dynamodb.Table("Notifications")
history_table = dynamodb.Table("DonationHistory")

# ── Helpers ───────────────────────────────────────────────────────────────────
def hash_password(password: str) -> str:
    return hashlib.sha256(password.encode()).hexdigest()

def now_str() -> str:
    return datetime.utcnow().isoformat()

def date_str(d: datetime) -> str:
    return d.strftime("%Y-%m-%d")

def future_date(days: int) -> str:
    return date_str(datetime.utcnow() + timedelta(days=days))

def past_date(days: int) -> str:
    return date_str(datetime.utcnow() - timedelta(days=days))

def clean(val) -> str:
    """Convert NaN / None to empty string."""
    if val is None:
        return ""
    if isinstance(val, float):
        import math
        if math.isnan(val):
            return ""
    return str(val).strip()

def to_decimal(val):
    """Convert float to Decimal for DynamoDB."""
    try:
        if val is None or (isinstance(val, float) and __import__('math').isnan(val)):
            return Decimal("0")
        return Decimal(str(round(float(val), 6)))
    except Exception:
        return Decimal("0")

def batch_write(table, items: list):
    """Write items in batches of 25."""
    for i in range(0, len(items), BATCH_SIZE):
        batch = items[i:i + BATCH_SIZE]
        with table.batch_writer() as writer:
            for item in batch:
                writer.put_item(Item=item)

# ── Blood group mapping ───────────────────────────────────────────────────────
BLOOD_GROUP_MAP = {
    "A Positive": "A+", "A Negative": "A-",
    "B Positive": "B+", "B Negative": "B-",
    "AB Positive": "AB+", "AB Negative": "AB-",
    "O Positive": "O+", "O Negative": "O-",
}

def normalize_blood_group(bg: str) -> str:
    return BLOOD_GROUP_MAP.get(bg.strip(), bg.strip())

# ── STEP 1: Load Donors from CSV ──────────────────────────────────────────────
def load_donors():
    print("\n📂 Loading donors from CSV...")
    df = pd.read_csv(CSV_FILE, low_memory=False)
    print(f"   Total rows in CSV: {len(df)}")

    # Filter only donor roles
    donor_roles = ["Emergency Donor", "Bridge Donor", "Volunteer"]
    donors_df = df[df["role"].isin(donor_roles)].copy()
    donors_df = donors_df.drop_duplicates(subset=["user_id"])
    print(f"   Unique donors found: {len(donors_df)}")

    items = []
    for _, row in donors_df.iterrows():
        uid = clean(row.get("user_id"))
        if not uid:
            continue

        blood_raw = clean(row.get("blood_group", ""))
        blood_group = normalize_blood_group(blood_raw) if blood_raw else ""

        item = {
            "user_id":                   uid,
            "role":                      "donor",
            "name":                      f"Donor {uid[:6]}",
            "email":                     f"{uid[:8]}@donor.bloodbridge.org",
            "mobile":                    f"+91{random.randint(7000000000, 9999999999)}",
            "password_hash":             hash_password("Donor@123"),
            "blood_group":               blood_group,
            "gender":                    clean(row.get("gender", "")),
            "city":                      "Hyderabad",
            "state":                     "Telangana",
            "latitude":                  to_decimal(row.get("latitude", 17.3850)),
            "longitude":                 to_decimal(row.get("longitude", 78.4867)),
            "registration_date":         clean(row.get("registration_date", now_str())),
            "donor_type":                clean(row.get("donor_type", "One-Time Donor")),
            "eligibility_status":        clean(row.get("eligibility_status", "eligible")),
            "last_donation_date":        clean(row.get("last_donation_date", "")),
            "next_eligible_date":        clean(row.get("next_eligible_date", "")),
            "donations_till_date":       int(to_decimal(row.get("donations_till_date", 0))),
            "total_calls":               int(to_decimal(row.get("total_calls", 0))),
            "calls_to_donations_ratio":  to_decimal(row.get("calls_to_donations_ratio", 0)),
            "user_donation_active_status": clean(row.get("user_donation_active_status", "Active")),
            "available_emergency":       True,
            "consent_notifications":     True,
            "inactive_trigger_comment":  clean(row.get("inactive_trigger_comment", "")),
            "bridge_id":                 clean(row.get("bridge_id", "")),
            "bridge_status":             str(row.get("bridge_status", False)),
            "role_status":               str(row.get("role_status", True)),
            "created_at":                now_str(),
        }
        items.append(item)

    print(f"   Writing {len(items)} donors to DynamoDB...")
    batch_write(users_table, items)
    print(f"   ✅ {len(items)} donors loaded!")
    return len(items)

# ── STEP 2: Create Fake Thalassemia Patients ──────────────────────────────────
PATIENT_NAMES = [
    "Aarav Sharma", "Priya Reddy", "Rahul Nair", "Sneha Patel",
    "Vikram Singh", "Ananya Iyer", "Karthik Rao", "Divya Menon",
    "Arjun Kumar", "Meera Pillai", "Suresh Babu", "Lakshmi Devi",
    "Rohit Verma", "Pooja Gupta", "Aditya Joshi", "Kavitha Nair",
    "Manoj Yadav", "Sushma Reddy", "Deepak Tiwari", "Riya Bose",
]

HOSPITALS = [
    ("Apollo Hospital", "Jubilee Hills, Hyderabad", 17.4239, 78.4738),
    ("AIIMS Hyderabad", "Bibinagar, Hyderabad", 17.4850, 78.5939),
    ("Nizam's Institute", "Punjagutta, Hyderabad", 17.4281, 78.4560),
    ("Yashoda Hospital", "Secunderabad", 17.4399, 78.4983),
    ("Care Hospital", "Banjara Hills, Hyderabad", 17.4156, 78.4488),
    ("Kamineni Hospital", "LB Nagar, Hyderabad", 17.3520, 78.5581),
    ("Continental Hospital", "Gachibowli, Hyderabad", 17.4399, 78.3489),
    ("KIMS Hospital", "Secunderabad", 17.4500, 78.5000),
]

BLOOD_GROUPS = ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"]

def load_patients():
    print("\n👥 Creating fake Thalassemia patients...")
    items = []
    patient_ids = []

    for i, pname in enumerate(PATIENT_NAMES):
        pid = str(uuid.uuid4())
        patient_ids.append(pid)
        blood_group = random.choice(BLOOD_GROUPS)
        hospital = random.choice(HOSPITALS)
        age = random.randint(5, 35)
        gender = random.choice(["Male", "Female"])

        item = {
            "user_id":                    pid,
            "role":                       "patient",
            "name":                       pname,
            "email":                      f"{pname.lower().replace(' ', '.')}{i}@patient.bloodbridge.org",
            "mobile":                     f"+91{random.randint(7000000000, 9999999999)}",
            "password_hash":              hash_password("Patient@123"),
            "blood_group":                blood_group,
            "gender":                     gender,
            "age":                        age,
            "city":                       "Hyderabad",
            "state":                      "Telangana",
            "latitude":                   to_decimal(hospital[2] + random.uniform(-0.05, 0.05)),
            "longitude":                  to_decimal(hospital[3] + random.uniform(-0.05, 0.05)),
            "hospital_name":              hospital[0],
            "hospital_location":          hospital[1],
            "hospital_latitude":          to_decimal(hospital[2]),
            "hospital_longitude":         to_decimal(hospital[3]),
            "condition":                  "Thalassemia",
            "emergency_contact_name":     f"Guardian of {pname}",
            "emergency_contact_number":   f"+91{random.randint(7000000000, 9999999999)}",
            "regular_transfusions":       True,
            "expected_requirement":       f"{random.randint(1, 3)} units every {random.choice([14, 21, 28])} days",
            "consent_share":              True,
            "consent_accurate":           True,
            "registration_date":          past_date(random.randint(30, 365)),
            "created_at":                 now_str(),
        }
        items.append(item)

    batch_write(users_table, items)
    print(f"   ✅ {len(items)} patients created!")
    return patient_ids

# ── STEP 3: Create Coordinator Account ───────────────────────────────────────
def load_coordinator():
    print("\n🎯 Creating coordinator account...")
    coordinator_id = "coordinator-bloodwarriors-001"
    item = {
        "user_id":        coordinator_id,
        "role":           "coordinator",
        "name":           "Blood Warriors Coordinator",
        "email":          "coordinator@bloodwarriors.org",
        "mobile":         "+91-9000000001",
        "password_hash":  hash_password("BloodWarriors@2025!"),
        "city":           "Hyderabad",
        "state":          "Telangana",
        "latitude":       to_decimal(17.3850),
        "longitude":      to_decimal(78.4867),
        "registration_date": now_str(),
        "created_at":     now_str(),
    }
    users_table.put_item(Item=item)
    print(f"   ✅ Coordinator created!")
    print(f"      Email:    coordinator@bloodwarriors.org")
    print(f"      Password: BloodWarriors@2025!")
    return coordinator_id

# ── STEP 4: Create Transfusion Cycles for Patients ───────────────────────────
def load_transfusion_cycles(patient_ids: list):
    print("\n🔄 Creating transfusion cycles for patients...")
    items = []

    for pid in patient_ids:
        frequency = random.choice([14, 21, 28])  # days between transfusions
        last_trans = past_date(random.randint(1, frequency))
        # Some patients have cycles due VERY soon (for demo auto-trigger)
        days_until_next = random.choice([2, 3, 5, 7, 10, 14, 21])
        next_trans = future_date(days_until_next)

        item = {
            "patient_id":            pid,
            "frequency_days":        frequency,
            "quantity_required":     random.randint(1, 3),
            "last_transfusion_date": last_trans,
            "next_transfusion_date": next_trans,
            "auto_request_enabled":  True,
            "last_auto_request_id":  "",
            "notes":                 "Thalassemia Major — regular transfusion required",
            "created_at":            now_str(),
            "updated_at":            now_str(),
        }
        items.append(item)

    batch_write(cycles_table, items)
    print(f"   ✅ {len(items)} transfusion cycles created!")

    # Show patients with upcoming cycles
    upcoming = [i for i in items if i["next_transfusion_date"] <= future_date(7)]
    print(f"   ⚡ {len(upcoming)} patients have transfusions due within 7 days (auto-trigger ready!)")

# ── STEP 5: Create Sample Blood Requests ─────────────────────────────────────
def load_blood_requests(patient_ids: list):
    print("\n🩸 Creating sample blood requests...")
    items = []
    request_ids = []
    urgency_levels = ["low", "medium", "high", "critical"]
    statuses = ["pending", "matching", "active", "fulfilled"]

    for i, pid in enumerate(patient_ids[:10]):  # 10 sample requests
        rid = str(uuid.uuid4())
        request_ids.append(rid)
        blood_group = random.choice(BLOOD_GROUPS)
        hospital = random.choice(HOSPITALS)

        item = {
            "request_id":       rid,
            "patient_id":       pid,
            "blood_group":      blood_group,
            "units_required":   random.randint(1, 3),
            "hospital":         hospital[0],
            "hospital_location": hospital[1],
            "hospital_latitude":  to_decimal(hospital[2]),
            "hospital_longitude": to_decimal(hospital[3]),
            "urgency":          random.choice(urgency_levels),
            "status":           statuses[i % len(statuses)],
            "auto_triggered":   random.choice([True, False]),
            "required_date":    future_date(random.randint(1, 7)),
            "notes":            "Regular Thalassemia transfusion request",
            "created_at":       past_date(random.randint(0, 5)),
            "updated_at":       now_str(),
        }
        items.append(item)

    batch_write(requests_table, items)
    print(f"   ✅ {len(items)} blood requests created!")
    return request_ids

# ── STEP 6: Create Sample Donor Matches ──────────────────────────────────────
def load_donor_matches(request_ids: list):
    print("\n🤝 Creating sample donor matches...")
    items = []
    match_statuses = ["pending", "notified", "accepted", "rejected"]

    # Get some donor IDs from Users table
    response = users_table.scan(
        FilterExpression=boto3.dynamodb.conditions.Attr("role").eq("donor"),
        Limit=50,
    )
    donor_sample = response.get("Items", [])
    if not donor_sample:
        print("   ⚠️  No donors found yet — skipping matches")
        return

    for rid in request_ids[:5]:
        # Pick 5 donors per request
        selected = random.sample(donor_sample, min(5, len(donor_sample)))
        for j, donor in enumerate(selected):
            item = {
                "request_id":    rid,
                "donor_id":      donor["user_id"],
                "priority_score": to_decimal(round(random.uniform(0.3, 1.0), 2)),
                "match_type":    "primary" if j < 3 else "backup",
                "status":        random.choice(match_statuses),
                "notified_at":   past_date(random.randint(0, 3)),
                "responded_at":  past_date(random.randint(0, 2)),
                "created_at":    now_str(),
            }
            items.append(item)

    batch_write(matches_table, items)
    print(f"   ✅ {len(items)} donor matches created!")

# ── STEP 7: Create Sample Notifications ──────────────────────────────────────
def load_notifications(patient_ids: list, request_ids: list):
    print("\n🔔 Creating sample notifications...")
    items = []

    notif_templates = [
        ("Blood Request Matched", "A compatible donor has been found for your request.", "request"),
        ("Transfusion Reminder", "Your next transfusion is scheduled in 3 days.", "reminder"),
        ("Donor Confirmed", "A donor has confirmed availability for your request.", "request"),
        ("Request Fulfilled", "Your blood request has been successfully fulfilled.", "system"),
        ("Upcoming Cycle", "Your transfusion cycle is due within 7 days.", "reminder"),
    ]

    all_user_ids = patient_ids + ["coordinator-bloodwarriors-001"]

    for uid in all_user_ids:
        for title, message, ntype in random.sample(notif_templates, 3):
            item = {
                "notification_id":   str(uuid.uuid4()),
                "user_id":           uid,
                "type":              ntype,
                "title":             title,
                "message":           message,
                "read":              random.choice([True, False]),
                "related_request_id": random.choice(request_ids) if request_ids else "",
                "created_at":        past_date(random.randint(0, 7)),
            }
            items.append(item)

    batch_write(notif_table, items)
    print(f"   ✅ {len(items)} notifications created!")

# ── STEP 8: Create Sample Donation History ────────────────────────────────────
def load_donation_history(patient_ids: list):
    print("\n📜 Creating donation history...")
    items = []

    response = users_table.scan(
        FilterExpression=boto3.dynamodb.conditions.Attr("role").eq("donor"),
        Limit=30,
    )
    donor_sample = response.get("Items", [])

    for i in range(20):
        if not donor_sample or not patient_ids:
            break
        donor = random.choice(donor_sample)
        patient_id = random.choice(patient_ids)
        hospital = random.choice(HOSPITALS)

        item = {
            "donation_id": str(uuid.uuid4()),
            "donor_id":    donor["user_id"],
            "patient_id":  patient_id,
            "request_id":  str(uuid.uuid4()),
            "units":       random.randint(1, 2),
            "date":        past_date(random.randint(1, 90)),
            "hospital":    hospital[0],
            "hospital_location": hospital[1],
            "created_at":  now_str(),
        }
        items.append(item)

    batch_write(history_table, items)
    print(f"   ✅ {len(items)} donation history records created!")

# ── MAIN ──────────────────────────────────────────────────────────────────────
def main():
    print("\n" + "=" * 60)
    print("  🩸 Blood Bridge AI — Full Data Loader")
    print("=" * 60)

    start = datetime.utcnow()

    # Run all steps
    donor_count  = load_donors()
    patient_ids  = load_patients()
    coord_id     = load_coordinator()
    load_transfusion_cycles(patient_ids)
    request_ids  = load_blood_requests(patient_ids)
    load_donor_matches(request_ids)
    load_notifications(patient_ids, request_ids)
    load_donation_history(patient_ids)

    elapsed = (datetime.utcnow() - start).seconds

    print("\n" + "=" * 60)
    print("  ✅ ALL DATA LOADED SUCCESSFULLY!")
    print("=" * 60)
    print(f"\n  📊 Summary:")
    print(f"     Donors loaded:        {donor_count}")
    print(f"     Patients created:     {len(patient_ids)}")
    print(f"     Coordinator:          1")
    print(f"     Transfusion cycles:   {len(patient_ids)}")
    print(f"     Blood requests:       10")
    print(f"     Donor matches:        ~25")
    print(f"     Notifications:        ~{len(patient_ids) * 3 + 3}")
    print(f"     Donation history:     20")
    print(f"\n  ⏱️  Time taken: {elapsed} seconds")
    print(f"\n  🔐 Coordinator Login:")
    print(f"     Email:    coordinator@bloodwarriors.org")
    print(f"     Password: BloodWarriors@2025!")
    print(f"\n  🎉 Ready for backend development!\n")

if __name__ == "__main__":
    main()