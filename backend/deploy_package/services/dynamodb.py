"""
Blood Bridge AI — DynamoDB Service
All database operations in one place
"""

import boto3
import uuid
from datetime import datetime, timezone
from decimal import Decimal
from boto3.dynamodb.conditions import Key, Attr

# ── Config ────────────────────────────────────────────────────────────────────
AWS_REGION = "us-east-1"

dynamodb = boto3.resource("dynamodb", region_name=AWS_REGION)

# ── Tables ────────────────────────────────────────────────────────────────────
users_table       = dynamodb.Table("Users")
requests_table    = dynamodb.Table("BloodRequests")
cycles_table      = dynamodb.Table("TransfusionCycles")
matches_table     = dynamodb.Table("DonorMatches")
notif_table       = dynamodb.Table("Notifications")
history_table     = dynamodb.Table("DonationHistory")

# ── Helpers ───────────────────────────────────────────────────────────────────
def now_str() -> str:
    return datetime.now(timezone.utc).isoformat()

def new_id() -> str:
    return str(uuid.uuid4())

def float_to_decimal(obj):
    """Recursively convert floats to Decimal for DynamoDB."""
    if isinstance(obj, float):
        return Decimal(str(obj))
    elif isinstance(obj, dict):
        return {k: float_to_decimal(v) for k, v in obj.items()}
    elif isinstance(obj, list):
        return [float_to_decimal(i) for i in obj]
    return obj

def decimal_to_float(obj):
    """Recursively convert Decimal back to float for JSON response."""
    if isinstance(obj, Decimal):
        return float(obj)
    elif isinstance(obj, dict):
        return {k: decimal_to_float(v) for k, v in obj.items()}
    elif isinstance(obj, list):
        return [decimal_to_float(i) for i in obj]
    return obj

# ── USER OPERATIONS ───────────────────────────────────────────────────────────

def get_user_by_id(user_id: str):
    response = users_table.get_item(Key={"user_id": user_id})
    item = response.get("Item")
    return decimal_to_float(item) if item else None

def get_user_by_email(email: str):
    response = users_table.scan(
        FilterExpression=Attr("email").eq(email)
    )
    items = response.get("Items", [])
    return decimal_to_float(items[0]) if items else None

def create_user(user_data: dict):
    user_data["user_id"] = user_data.get("user_id") or new_id()
    user_data["created_at"] = now_str()
    user_data = float_to_decimal(user_data)
    users_table.put_item(Item=user_data)
    return user_data["user_id"]

def update_user(user_id: str, updates: dict):
    updates = float_to_decimal(updates)
    updates["updated_at"] = now_str()
    expression = "SET " + ", ".join(f"#{k} = :{k}" for k in updates)
    attr_names  = {f"#{k}": k for k in updates}
    attr_values = {f":{k}": v for k, v in updates.items()}
    users_table.update_item(
        Key={"user_id": user_id},
        UpdateExpression=expression,
        ExpressionAttributeNames=attr_names,
        ExpressionAttributeValues=attr_values,
    )

def get_all_donors(blood_group: str = None, eligible_only: bool = False):
    filter_expr = Attr("role").eq("donor")
    if blood_group:
        filter_expr = filter_expr & Attr("blood_group").eq(blood_group)
    if eligible_only:
        filter_expr = filter_expr & Attr("eligibility_status").eq("eligible")

    response = users_table.scan(FilterExpression=filter_expr)
    items = response.get("Items", [])

    # Handle pagination
    while "LastEvaluatedKey" in response:
        response = users_table.scan(
            FilterExpression=filter_expr,
            ExclusiveStartKey=response["LastEvaluatedKey"]
        )
        items.extend(response.get("Items", []))

    return decimal_to_float(items)

def get_all_patients():
    response = users_table.scan(
        FilterExpression=Attr("role").eq("patient")
    )
    items = response.get("Items", [])
    while "LastEvaluatedKey" in response:
        response = users_table.scan(
            FilterExpression=Attr("role").eq("patient"),
            ExclusiveStartKey=response["LastEvaluatedKey"]
        )
        items.extend(response.get("Items", []))
    return decimal_to_float(items)

# ── BLOOD REQUEST OPERATIONS ──────────────────────────────────────────────────

def create_blood_request(request_data: dict):
    request_data["request_id"] = new_id()
    request_data["status"]     = "pending"
    request_data["created_at"] = now_str()
    request_data["updated_at"] = now_str()
    request_data = float_to_decimal(request_data)
    requests_table.put_item(Item=request_data)
    return request_data["request_id"]

def get_request_by_id(request_id: str):
    response = requests_table.get_item(Key={"request_id": request_id})
    item = response.get("Item")
    return decimal_to_float(item) if item else None

def get_all_requests(status: str = None):
    if status:
        response = requests_table.scan(
            FilterExpression=Attr("status").eq(status)
        )
    else:
        response = requests_table.scan()
    items = response.get("Items", [])
    while "LastEvaluatedKey" in response:
        response = requests_table.scan(
            ExclusiveStartKey=response["LastEvaluatedKey"]
        )
        items.extend(response.get("Items", []))
    return decimal_to_float(items)

def get_requests_by_patient(patient_id: str):
    response = requests_table.scan(
        FilterExpression=Attr("patient_id").eq(patient_id)
    )
    items = response.get("Items", [])
    return decimal_to_float(items)

def update_request_status(request_id: str, status: str):
    requests_table.update_item(
        Key={"request_id": request_id},
        UpdateExpression="SET #s = :s, updated_at = :u",
        ExpressionAttributeNames={"#s": "status"},
        ExpressionAttributeValues={":s": status, ":u": now_str()},
    )

# ── TRANSFUSION CYCLE OPERATIONS ──────────────────────────────────────────────

def get_cycle_by_patient(patient_id: str):
    response = cycles_table.get_item(Key={"patient_id": patient_id})
    item = response.get("Item")
    return decimal_to_float(item) if item else None

def get_upcoming_cycles(days_ahead: int = 7):
    """Get patients whose next transfusion is within X days."""
    from datetime import timedelta
    today = datetime.now(timezone.utc).date()
    cutoff = (today + timedelta(days=days_ahead)).isoformat()

    response = cycles_table.scan(
        FilterExpression=Attr("next_transfusion_date").lte(cutoff)
        & Attr("auto_request_enabled").eq(True)
    )
    items = response.get("Items", [])
    return decimal_to_float(items)

def update_cycle(patient_id: str, updates: dict):
    updates = float_to_decimal(updates)
    updates["updated_at"] = now_str()
    expression  = "SET " + ", ".join(f"#{k} = :{k}" for k in updates)
    attr_names  = {f"#{k}": k for k in updates}
    attr_values = {f":{k}": v for k, v in updates.items()}
    cycles_table.update_item(
        Key={"patient_id": patient_id},
        UpdateExpression=expression,
        ExpressionAttributeNames=attr_names,
        ExpressionAttributeValues=attr_values,
    )

# ── DONOR MATCH OPERATIONS ────────────────────────────────────────────────────

def save_donor_matches(request_id: str, matches: list):
    with matches_table.batch_writer() as writer:
        for match in matches:
            match["request_id"] = request_id
            match["created_at"] = now_str()
            writer.put_item(Item=float_to_decimal(match))

def get_matches_by_request(request_id: str):
    response = matches_table.query(
        KeyConditionExpression=Key("request_id").eq(request_id)
    )
    items = response.get("Items", [])
    return decimal_to_float(items)

def update_match_status(request_id: str, donor_id: str, status: str):
    matches_table.update_item(
        Key={"request_id": request_id, "donor_id": donor_id},
        UpdateExpression="SET #s = :s, responded_at = :r",
        ExpressionAttributeNames={"#s": "status"},
        ExpressionAttributeValues={":s": status, ":r": now_str()},
    )

# ── NOTIFICATION OPERATIONS ───────────────────────────────────────────────────

def create_notification(user_id: str, title: str, message: str,
                         notif_type: str = "system", related_request_id: str = ""):
    item = {
        "notification_id":    new_id(),
        "user_id":            user_id,
        "type":               notif_type,
        "title":              title,
        "message":            message,
        "read":               False,
        "related_request_id": related_request_id,
        "created_at":         now_str(),
    }
    notif_table.put_item(Item=item)
    return item["notification_id"]

def get_notifications_by_user(user_id: str):
    response = notif_table.scan(
        FilterExpression=Attr("user_id").eq(user_id)
    )
    items = response.get("Items", [])
    items.sort(key=lambda x: x.get("created_at", ""), reverse=True)
    return decimal_to_float(items)

def mark_notification_read(notification_id: str):
    notif_table.update_item(
        Key={"notification_id": notification_id},
        UpdateExpression="SET #r = :r",
        ExpressionAttributeNames={"#r": "read"},
        ExpressionAttributeValues={":r": True},
    )

# ── DONATION HISTORY OPERATIONS ───────────────────────────────────────────────

def create_donation_record(donor_id: str, patient_id: str,
                            request_id: str, units: int, hospital: str):
    item = {
        "donation_id": new_id(),
        "donor_id":    donor_id,
        "patient_id":  patient_id,
        "request_id":  request_id,
        "units":       units,
        "hospital":    hospital,
        "date":        now_str(),
        "created_at":  now_str(),
    }
    history_table.put_item(Item=item)
    return item["donation_id"]

def get_donation_history_by_donor(donor_id: str):
    response = history_table.scan(
        FilterExpression=Attr("donor_id").eq(donor_id)
    )
    items = response.get("Items", [])
    items.sort(key=lambda x: x.get("date", ""), reverse=True)
    return decimal_to_float(items)

def get_donation_history_by_patient(patient_id: str):
    response = history_table.scan(
        FilterExpression=Attr("patient_id").eq(patient_id)
    )
    items = response.get("Items", [])
    items.sort(key=lambda x: x.get("date", ""), reverse=True)
    return decimal_to_float(items)

# ── ANALYTICS ─────────────────────────────────────────────────────────────────

def get_dashboard_stats():
    """Get overall stats for coordinator dashboard."""
    donors_resp   = users_table.scan(FilterExpression=Attr("role").eq("donor"), Select="COUNT")
    patients_resp = users_table.scan(FilterExpression=Attr("role").eq("patient"), Select="COUNT")
    requests_resp = requests_table.scan(Select="COUNT")
    fulfilled     = requests_table.scan(FilterExpression=Attr("status").eq("fulfilled"), Select="COUNT")
    pending       = requests_table.scan(FilterExpression=Attr("status").eq("pending"), Select="COUNT")
    active        = requests_table.scan(FilterExpression=Attr("status").eq("active"), Select="COUNT")
    eligible      = users_table.scan(
        FilterExpression=Attr("role").eq("donor") & Attr("eligibility_status").eq("eligible"),
        Select="COUNT"
    )

    return {
        "total_donors":        donors_resp.get("Count", 0),
        "total_patients":      patients_resp.get("Count", 0),
        "total_requests":      requests_resp.get("Count", 0),
        "fulfilled_requests":  fulfilled.get("Count", 0),
        "pending_requests":    pending.get("Count", 0),
        "active_requests":     active.get("Count", 0),
        "eligible_donors":     eligible.get("Count", 0),
    }