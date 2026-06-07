"""
Blood Bridge AI — Blood Request Routes
POST /requests
GET  /requests
GET  /requests/{request_id}
PUT  /requests/{request_id}/status
POST /requests/{request_id}/match
POST /requests/auto-trigger
"""

from fastapi import APIRouter, HTTPException, Header, Query
from pydantic import BaseModel
from typing import Optional
from datetime import datetime, timezone, timedelta

from services.dynamodb import (
    create_blood_request,
    get_request_by_id,
    get_all_requests,
    get_requests_by_patient,
    update_request_status,
    get_all_donors,
    get_user_by_id,
    save_donor_matches,
    get_matches_by_request,
    get_upcoming_cycles,
    update_cycle,
    create_notification,
    create_donation_record,
    get_cycle_by_patient,
)
from services.bedrock import match_donors_to_request
from routes.auth import get_current_user

router = APIRouter(prefix="/requests", tags=["Blood Requests"])

# ── Schemas ───────────────────────────────────────────────────────────────────
class CreateRequestSchema(BaseModel):
    blood_group:        str
    units_required:     int
    hospital:           str
    hospital_location:  Optional[str]   = None
    hospital_latitude:  Optional[float] = None
    hospital_longitude: Optional[float] = None
    urgency:            Optional[str]   = "medium"
    required_date:      Optional[str]   = None
    notes:              Optional[str]   = ""
    auto_triggered:     Optional[bool]  = False

class UpdateStatusSchema(BaseModel):
    status: str  # pending / matching / active / fulfilled / cancelled

class FulfillSchema(BaseModel):
    donor_id:  str
    units:     int
    hospital:  str

# ── Routes ────────────────────────────────────────────────────────────────────

@router.post("")
def create_request(
    data: CreateRequestSchema,
    authorization: str = Header(None),
):
    """Create a new blood request — patient or coordinator."""
    current_user = get_current_user(authorization)

    if current_user["role"] not in ["patient", "coordinator"]:
        raise HTTPException(status_code=403, detail="Patients and coordinators only")

    # Set patient_id
    patient_id = current_user["user_id"]

    # Default required_date to 3 days from now
    required_date = data.required_date or (
        datetime.now(timezone.utc) + timedelta(days=3)
    ).strftime("%Y-%m-%d")

    request_data = {
        "patient_id":         patient_id,
        "blood_group":        data.blood_group,
        "units_required":     data.units_required,
        "hospital":           data.hospital,
        "hospital_location":  data.hospital_location or "",
        "hospital_latitude":  data.hospital_latitude,
        "hospital_longitude": data.hospital_longitude,
        "urgency":            data.urgency,
        "required_date":      required_date,
        "notes":              data.notes or "",
        "auto_triggered":     data.auto_triggered,
    }

    request_id = create_blood_request(request_data)

    # Notify coordinator
    create_notification(
        user_id="coordinator-bloodwarriors-001",
        title="New Blood Request",
        message=f"New {data.blood_group} blood request at {data.hospital} — Urgency: {data.urgency}",
        notif_type="request",
        related_request_id=request_id,
    )

    return {
        "success":    True,
        "message":    "Blood request created successfully",
        "request_id": request_id,
    }


@router.get("")
def list_requests(
    status:        Optional[str] = Query(None),
    authorization: str           = Header(None),
):
    """Get all requests — coordinator sees all, patient sees own."""
    current_user = get_current_user(authorization)

    if current_user["role"] == "coordinator":
        requests = get_all_requests(status=status)
    elif current_user["role"] == "patient":
        requests = get_requests_by_patient(current_user["user_id"])
    else:
        raise HTTPException(status_code=403, detail="Access denied")

    # Enrich with patient name
    for req in requests:
        patient = get_user_by_id(req.get("patient_id", ""))
        if patient:
            req["patient_name"] = patient.get("name", "Unknown")
            req["patient_mobile"] = patient.get("mobile", "")

    # Sort by created_at descending
    requests.sort(key=lambda x: x.get("created_at", ""), reverse=True)

    return {
        "success":  True,
        "count":    len(requests),
        "requests": requests,
    }


@router.get("/{request_id}")
def get_request(request_id: str, authorization: str = Header(None)):
    """Get a single blood request with matches."""
    current_user = get_current_user(authorization)

    request = get_request_by_id(request_id)
    if not request:
        raise HTTPException(status_code=404, detail="Request not found")

    # Patients can only view their own
    if current_user["role"] == "patient" and request["patient_id"] != current_user["user_id"]:
        raise HTTPException(status_code=403, detail="Access denied")

    # Get matched donors
    matches = get_matches_by_request(request_id)
    matches.sort(key=lambda x: float(x.get("priority_score", 0)), reverse=True)

    # Enrich matches with donor details
    for m in matches:
        donor = get_user_by_id(m.get("donor_id", ""))
        if donor:
            m["donor_name"]   = donor.get("name", "Unknown")
            m["blood_group"]  = donor.get("blood_group", "")
            m["donor_mobile"] = donor.get("mobile", "")
            m["donor_city"]   = donor.get("city", "")

    # Get patient info
    patient = get_user_by_id(request.get("patient_id", ""))
    if patient:
        request["patient_name"]   = patient.get("name", "Unknown")
        request["patient_mobile"] = patient.get("mobile", "")

    return {
        "success":        True,
        "request":        request,
        "matched_donors": matches,
        "primary_count":  len([m for m in matches if m.get("match_type") == "primary"]),
        "backup_count":   len([m for m in matches if m.get("match_type") == "backup"]),
    }


@router.put("/{request_id}/status")
def update_status(
    request_id: str,
    data: UpdateStatusSchema,
    authorization: str = Header(None),
):
    """Update request status — coordinator only."""
    current_user = get_current_user(authorization)
    if current_user["role"] != "coordinator":
        raise HTTPException(status_code=403, detail="Coordinators only")

    valid_statuses = ["pending", "matching", "active", "fulfilled", "cancelled"]
    if data.status not in valid_statuses:
        raise HTTPException(
            status_code=400,
            detail=f"Invalid status. Must be one of: {valid_statuses}"
        )

    request = get_request_by_id(request_id)
    if not request:
        raise HTTPException(status_code=404, detail="Request not found")

    update_request_status(request_id, data.status)

    # Notify patient
    create_notification(
        user_id=request["patient_id"],
        title="Request Status Updated",
        message=f"Your blood request status has been updated to: {data.status}",
        notif_type="request",
        related_request_id=request_id,
    )

    return {
        "success": True,
        "message": f"Request status updated to {data.status}",
    }


@router.post("/{request_id}/match")
def run_ai_matching(request_id: str, authorization: str = Header(None)):
    """
    Run AI matching for a blood request.
    Scores all eligible donors and saves top primary + backup donors.
    """
    current_user = get_current_user(authorization)
    if current_user["role"] != "coordinator":
        raise HTTPException(status_code=403, detail="Coordinators only")

    request = get_request_by_id(request_id)
    if not request:
        raise HTTPException(status_code=404, detail="Request not found")

    # Get all donors
    all_donors = get_all_donors()
    if not all_donors:
        raise HTTPException(status_code=404, detail="No donors found in database")

    # Run AI matching
    result = match_donors_to_request(
        request=request,
        all_donors=all_donors,
        top_primary=5,
        top_backup=10,
    )

    # Save matches to DynamoDB
    all_matches = result["primary_donors"] + result["backup_donors"]
    if all_matches:
        save_donor_matches(request_id, all_matches)

    # Update request status to matching
    update_request_status(request_id, "matching")

    # Notify primary donors
    for donor in result["primary_donors"]:
        create_notification(
            user_id=donor["donor_id"],
            title="Blood Donation Request",
            message=(
                f"Urgent: A Thalassemia patient needs {request['blood_group']} blood "
                f"at {request['hospital']}. Can you help?"
            ),
            notif_type="request",
            related_request_id=request_id,
        )

    # Notify patient
    create_notification(
        user_id=request["patient_id"],
        title="Donors Matched",
        message=(
            f"Great news! {len(result['primary_donors'])} donors have been matched "
            f"to your blood request."
        ),
        notif_type="request",
        related_request_id=request_id,
    )

    return {
        "success":                True,
        "message":                "AI matching completed",
        "request_id":             request_id,
        "blood_group":            result["blood_group"],
        "total_eligible":         result["total_eligible"],
        "primary_donors":         result["primary_donors"],
        "backup_donors":          result["backup_donors"],
        "fulfillment_prediction": result["fulfillment_prediction"],
        "matched_at":             result["matched_at"],
    }


@router.post("/{request_id}/fulfill")
def fulfill_request(
    request_id: str,
    data: FulfillSchema,
    authorization: str = Header(None),
):
    """Mark a request as fulfilled after donation."""
    current_user = get_current_user(authorization)
    if current_user["role"] != "coordinator":
        raise HTTPException(status_code=403, detail="Coordinators only")

    request = get_request_by_id(request_id)
    if not request:
        raise HTTPException(status_code=404, detail="Request not found")

    # Create donation record
    create_donation_record(
        donor_id=data.donor_id,
        patient_id=request["patient_id"],
        request_id=request_id,
        units=data.units,
        hospital=data.hospital,
    )

    # Update request to fulfilled
    update_request_status(request_id, "fulfilled")

    # Notify patient
    create_notification(
        user_id=request["patient_id"],
        title="Request Fulfilled!",
        message=f"Your blood request has been fulfilled. {data.units} unit(s) donated at {data.hospital}.",
        notif_type="request",
        related_request_id=request_id,
    )

    # Notify donor
    create_notification(
        user_id=data.donor_id,
        title="Thank You!",
        message="Your donation has been recorded. You've helped save a life today!",
        notif_type="system",
        related_request_id=request_id,
    )

    return {
        "success": True,
        "message": "Request fulfilled and donation recorded",
    }


@router.post("/auto-trigger")
def auto_trigger_cycles(authorization: str = Header(None)):
    """
    Auto-trigger blood requests for patients
    whose transfusion cycle is due within 7 days.
    Called by EventBridge daily cron job.
    """
    current_user = get_current_user(authorization)
    if current_user["role"] != "coordinator":
        raise HTTPException(status_code=403, detail="Coordinators only")

    # Get patients with upcoming cycles
    upcoming = get_upcoming_cycles(days_ahead=7)

    triggered = []
    for cycle in upcoming:
        patient_id = cycle["patient_id"]
        patient    = get_user_by_id(patient_id)
        if not patient:
            continue

        # Create auto blood request
        request_data = {
            "patient_id":     patient_id,
            "blood_group":    patient.get("blood_group", ""),
            "units_required": int(cycle.get("quantity_required", 1)),
            "hospital":       patient.get("hospital_name", ""),
            "hospital_location": patient.get("hospital_location", ""),
            "hospital_latitude":  patient.get("hospital_latitude"),
            "hospital_longitude": patient.get("hospital_longitude"),
            "urgency":        "high",
            "required_date":  cycle.get("next_transfusion_date", ""),
            "notes":          "Auto-triggered by transfusion cycle scheduler",
            "auto_triggered": True,
        }

        request_id = create_blood_request(request_data)

        # Update cycle's last_auto_request_id
        next_date = (
            datetime.now(timezone.utc) + timedelta(days=int(cycle.get("frequency_days", 21)))
        ).strftime("%Y-%m-%d")

        update_cycle(patient_id, {
            "last_auto_request_id": request_id,
            "last_transfusion_date": cycle.get("next_transfusion_date", ""),
            "next_transfusion_date": next_date,
        })

        # Notify coordinator
        create_notification(
            user_id="coordinator-bloodwarriors-001",
            title="Auto Request Created",
            message=(
                f"Transfusion cycle due for patient {patient.get('name', patient_id)}. "
                f"Auto blood request created — {patient.get('blood_group', '')} needed."
            ),
            notif_type="reminder",
            related_request_id=request_id,
        )

        # Notify patient
        create_notification(
            user_id=patient_id,
            title="Transfusion Request Created",
            message=(
                f"Your upcoming transfusion on {cycle.get('next_transfusion_date', '')} "
                f"has been automatically scheduled."
            ),
            notif_type="reminder",
            related_request_id=request_id,
        )

        triggered.append({
            "patient_id":   patient_id,
            "patient_name": patient.get("name", ""),
            "request_id":   request_id,
            "blood_group":  patient.get("blood_group", ""),
            "due_date":     cycle.get("next_transfusion_date", ""),
        })

    return {
        "success":          True,
        "message":          f"Auto-triggered {len(triggered)} blood requests",
        "triggered_count":  len(triggered),
        "triggered":        triggered,
    }