"""
Blood Bridge AI — AI Routes
GET  /ai/insights
POST /ai/score-donor
POST /ai/match
GET  /ai/fulfillment-prediction/{request_id}
GET  /ai/donor-message/{donor_id}/{request_id}
"""

from fastapi import APIRouter, HTTPException, Header
from pydantic import BaseModel
from typing import Optional

from services.dynamodb import (
    get_all_donors,
    get_request_by_id,
    get_user_by_id,
    get_dashboard_stats,
    get_matches_by_request,
)
from services.bedrock import (
    match_donors_to_request,
    calculate_priority_score,
    predict_fulfillment,
    get_ai_insights,
    get_donor_engagement_message,
    get_compatible_blood_groups,
)
from routes.auth import get_current_user

router = APIRouter(prefix="/ai", tags=["AI"])

# ── Schemas ───────────────────────────────────────────────────────────────────
class ScoreDonorSchema(BaseModel):
    donor_id:   str
    request_id: str

class ManualMatchSchema(BaseModel):
    blood_group:        str
    units_required:     Optional[int]   = 1
    hospital_latitude:  Optional[float] = None
    hospital_longitude: Optional[float] = None
    urgency:            Optional[str]   = "medium"
    top_primary:        Optional[int]   = 5
    top_backup:         Optional[int]   = 10

# ── Routes ────────────────────────────────────────────────────────────────────

@router.get("/insights")
def ai_insights(authorization: str = Header(None)):
    """
    Get AI-generated insights for coordinator dashboard.
    Uses Amazon Bedrock Claude.
    """
    current_user = get_current_user(authorization)
    if current_user["role"] != "coordinator":
        raise HTTPException(status_code=403, detail="Coordinators only")

    # Get platform stats
    stats = get_dashboard_stats()

    # Get AI insights from Bedrock
    insights_text = get_ai_insights(stats)

    return {
        "success":  True,
        "stats":    stats,
        "insights": insights_text,
    }


@router.post("/score-donor")
def score_single_donor(
    data: ScoreDonorSchema,
    authorization: str = Header(None),
):
    """
    Score a single donor against a specific request.
    Returns detailed breakdown of the priority score.
    """
    current_user = get_current_user(authorization)
    if current_user["role"] != "coordinator":
        raise HTTPException(status_code=403, detail="Coordinators only")

    donor = get_user_by_id(data.donor_id)
    if not donor:
        raise HTTPException(status_code=404, detail="Donor not found")

    request = get_request_by_id(data.request_id)
    if not request:
        raise HTTPException(status_code=404, detail="Request not found")

    score = calculate_priority_score(donor, request)

    # Score breakdown
    ratio           = float(donor.get("calls_to_donations_ratio") or 0)
    total_donations = int(donor.get("donations_till_date") or 0)
    eligibility     = donor.get("eligibility_status", "")
    active_status   = donor.get("user_donation_active_status", "")
    last_donation   = donor.get("last_donation_date", "")

    return {
        "success":        True,
        "donor_id":       data.donor_id,
        "request_id":     data.request_id,
        "priority_score": score,
        "score_breakdown": {
            "response_rate": {
                "weight": "40%",
                "value":  ratio,
                "label":  "calls_to_donations_ratio",
            },
            "donation_success": {
                "weight": "20%",
                "value":  total_donations,
                "label":  "total donations made",
            },
            "availability": {
                "weight": "20%",
                "value":  f"{eligibility} / {active_status}",
                "label":  "eligibility + active status",
            },
            "distance": {
                "weight": "10%",
                "value":  "based on GPS coordinates",
                "label":  "distance to hospital",
            },
            "recency": {
                "weight": "10%",
                "value":  last_donation or "Never donated",
                "label":  "last donation date",
            },
        },
        "donor_summary": {
            "name":        donor.get("name"),
            "blood_group": donor.get("blood_group"),
            "city":        donor.get("city"),
            "eligibility": eligibility,
        }
    }


@router.post("/match")
def manual_match(
    data: ManualMatchSchema,
    authorization: str = Header(None),
):
    """
    Run AI matching manually without an existing request.
    Useful for coordinator to preview matches before creating request.
    """
    current_user = get_current_user(authorization)
    if current_user["role"] != "coordinator":
        raise HTTPException(status_code=403, detail="Coordinators only")

    # Build a temp request object
    temp_request = {
        "request_id":         "preview",
        "blood_group":        data.blood_group,
        "units_required":     data.units_required,
        "hospital_latitude":  data.hospital_latitude,
        "hospital_longitude": data.hospital_longitude,
        "urgency":            data.urgency,
    }

    # Get all donors
    all_donors = get_all_donors(blood_group=None, eligible_only=False)

    # Run matching
    result = match_donors_to_request(
        request=temp_request,
        all_donors=all_donors,
        top_primary=data.top_primary,
        top_backup=data.top_backup,
    )

    return {
        "success":                True,
        "blood_group":            data.blood_group,
        "compatible_groups":      get_compatible_blood_groups(data.blood_group),
        "total_eligible":         result["total_eligible"],
        "primary_donors":         result["primary_donors"],
        "backup_donors":          result["backup_donors"],
        "fulfillment_prediction": result["fulfillment_prediction"],
    }


@router.get("/fulfillment-prediction/{request_id}")
def get_fulfillment_prediction(
    request_id: str,
    authorization: str = Header(None),
):
    """
    Get fulfillment prediction for an existing request
    based on its current matched donors.
    """
    current_user = get_current_user(authorization)
    if current_user["role"] != "coordinator":
        raise HTTPException(status_code=403, detail="Coordinators only")

    request = get_request_by_id(request_id)
    if not request:
        raise HTTPException(status_code=404, detail="Request not found")

    matches = get_matches_by_request(request_id)
    primary = [m for m in matches if m.get("match_type") == "primary"]

    prediction = predict_fulfillment(primary, request)

    return {
        "success":                True,
        "request_id":             request_id,
        "blood_group":            request.get("blood_group"),
        "urgency":                request.get("urgency"),
        "total_matches":          len(matches),
        "primary_matches":        len(primary),
        "fulfillment_prediction": prediction,
        "prediction_label": {
            "high":   "Very likely to be fulfilled — strong donor pool",
            "medium": "Moderately likely — may need backup activation",
            "low":    "At risk — consider expanding search or escalating",
        }.get(prediction, "Unknown"),
    }


@router.get("/donor-message/{donor_id}/{request_id}")
def generate_donor_message(
    donor_id:   str,
    request_id: str,
    authorization: str = Header(None),
):
    """
    Generate a personalized donor outreach message using Claude.
    """
    current_user = get_current_user(authorization)
    if current_user["role"] != "coordinator":
        raise HTTPException(status_code=403, detail="Coordinators only")

    donor = get_user_by_id(donor_id)
    if not donor:
        raise HTTPException(status_code=404, detail="Donor not found")

    request = get_request_by_id(request_id)
    if not request:
        raise HTTPException(status_code=404, detail="Request not found")

    message = get_donor_engagement_message(donor, request)

    return {
        "success":    True,
        "donor_id":   donor_id,
        "request_id": request_id,
        "message":    message,
        "donor_name": donor.get("name"),
        "channel":    "SMS",
    }


@router.get("/blood-compatibility/{blood_group}")
def blood_compatibility(blood_group: str, authorization: str = Header(None)):
    """Get compatible blood groups for a given blood group."""
    get_current_user(authorization)

    compatible = get_compatible_blood_groups(blood_group)

    return {
        "success":           True,
        "blood_group":       blood_group,
        "compatible_donors": compatible,
        "total_compatible":  len(compatible),
    }