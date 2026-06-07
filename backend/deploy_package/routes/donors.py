"""
Blood Bridge AI — Donor Routes
GET  /donors
GET  /donors/{donor_id}
PUT  /donors/{donor_id}
GET  /donors/{donor_id}/history
GET  /donors/stats/summary
"""

from fastapi import APIRouter, HTTPException, Header, Query
from pydantic import BaseModel
from typing import Optional
from datetime import datetime, timezone

from services.dynamodb import (
    get_user_by_id,
    get_all_donors,
    update_user,
    get_donation_history_by_donor,
    get_notifications_by_user,
)
from routes.auth import get_current_user

router = APIRouter(prefix="/donors", tags=["Donors"])

# ── Schemas ───────────────────────────────────────────────────────────────────
class DonorUpdateRequest(BaseModel):
    name:               Optional[str]   = None
    mobile:             Optional[str]   = None
    city:               Optional[str]   = None
    state:              Optional[str]   = None
    latitude:           Optional[float] = None
    longitude:          Optional[float] = None
    available_emergency: Optional[bool] = None
    eligibility_status: Optional[str]   = None
    last_donation_date: Optional[str]   = None

# ── Routes ────────────────────────────────────────────────────────────────────

@router.get("")
def list_donors(
    blood_group:   Optional[str]  = Query(None),
    eligible_only: Optional[bool] = Query(False),
    limit:         Optional[int]  = Query(100),
    authorization: str            = Header(None),
):
    """Get all donors — coordinator only."""
    current_user = get_current_user(authorization)
    if current_user["role"] != "coordinator":
        raise HTTPException(status_code=403, detail="Coordinators only")

    donors = get_all_donors(
        blood_group=blood_group,
        eligible_only=eligible_only,
    )

    # Remove sensitive fields
    for d in donors:
        d.pop("password_hash", None)

    # Apply limit
    donors = donors[:limit]

    return {
        "success": True,
        "count":   len(donors),
        "donors":  donors,
    }


@router.get("/stats/summary")
def donor_stats(authorization: str = Header(None)):
    """Get donor statistics — coordinator only."""
    current_user = get_current_user(authorization)
    if current_user["role"] != "coordinator":
        raise HTTPException(status_code=403, detail="Coordinators only")

    all_donors = get_all_donors()

    total       = len(all_donors)
    eligible    = len([d for d in all_donors if d.get("eligibility_status") == "eligible"])
    active      = len([d for d in all_donors if d.get("user_donation_active_status", "").lower() == "active"])
    inactive    = len([d for d in all_donors if d.get("user_donation_active_status", "").lower() == "inactive"])
    regular     = len([d for d in all_donors if d.get("donor_type") == "Regular Donor"])
    one_time    = len([d for d in all_donors if d.get("donor_type") == "One-Time Donor"])

    # Blood group breakdown
    bg_counts = {}
    for d in all_donors:
        bg = d.get("blood_group", "Unknown")
        bg_counts[bg] = bg_counts.get(bg, 0) + 1

    # Top donors by donations
    top_donors = sorted(
        all_donors,
        key=lambda x: int(x.get("donations_till_date") or 0),
        reverse=True
    )[:10]
    for d in top_donors:
        d.pop("password_hash", None)

    return {
        "success": True,
        "stats": {
            "total_donors":    total,
            "eligible_donors": eligible,
            "active_donors":   active,
            "inactive_donors": inactive,
            "regular_donors":  regular,
            "one_time_donors": one_time,
            "blood_group_breakdown": bg_counts,
        },
        "top_donors": top_donors,
    }


@router.get("/{donor_id}")
def get_donor(donor_id: str, authorization: str = Header(None)):
    """Get a single donor by ID."""
    current_user = get_current_user(authorization)

    # Donors can only view their own profile
    if current_user["role"] == "donor" and current_user["user_id"] != donor_id:
        raise HTTPException(status_code=403, detail="Access denied")

    donor = get_user_by_id(donor_id)
    if not donor or donor.get("role") != "donor":
        raise HTTPException(status_code=404, detail="Donor not found")

    donor.pop("password_hash", None)
    return {"success": True, "donor": donor}


@router.put("/{donor_id}")
def update_donor(
    donor_id: str,
    data: DonorUpdateRequest,
    authorization: str = Header(None),
):
    """Update donor profile."""
    current_user = get_current_user(authorization)

    # Only the donor themselves or coordinator can update
    if current_user["role"] == "donor" and current_user["user_id"] != donor_id:
        raise HTTPException(status_code=403, detail="Access denied")

    donor = get_user_by_id(donor_id)
    if not donor:
        raise HTTPException(status_code=404, detail="Donor not found")

    updates = {k: v for k, v in data.dict().items() if v is not None}
    if not updates:
        raise HTTPException(status_code=400, detail="No fields to update")

    update_user(donor_id, updates)

    return {"success": True, "message": "Donor updated successfully"}


@router.get("/{donor_id}/history")
def get_donor_history(donor_id: str, authorization: str = Header(None)):
    """Get donation history for a donor."""
    current_user = get_current_user(authorization)

    if current_user["role"] == "donor" and current_user["user_id"] != donor_id:
        raise HTTPException(status_code=403, detail="Access denied")

    history = get_donation_history_by_donor(donor_id)

    return {
        "success":       True,
        "donor_id":      donor_id,
        "total_donations": len(history),
        "history":       history,
    }


@router.get("/{donor_id}/notifications")
def get_donor_notifications(donor_id: str, authorization: str = Header(None)):
    """Get notifications for a donor."""
    current_user = get_current_user(authorization)

    if current_user["role"] == "donor" and current_user["user_id"] != donor_id:
        raise HTTPException(status_code=403, detail="Access denied")

    notifications = get_notifications_by_user(donor_id)

    return {
        "success":       True,
        "donor_id":      donor_id,
        "notifications": notifications,
        "unread_count":  len([n for n in notifications if not n.get("read")]),
    }