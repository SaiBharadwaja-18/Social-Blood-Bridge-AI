"""
Blood Bridge AI — Bedrock AI Service
Uses Amazon Bedrock (Claude) for:
1. Donor priority scoring
2. Fulfillment prediction
3. Smart insights
"""

import boto3
import json
import math
from datetime import datetime, timezone, timedelta
from decimal import Decimal

# ── Config ────────────────────────────────────────────────────────────────────
AWS_REGION   = "us-east-1"
MODEL_ID = "us.anthropic.claude-haiku-4-5-20251001-v1:0"  # Cheapest & fastest

bedrock = boto3.client(
    service_name="bedrock-runtime",
    region_name=AWS_REGION,
)

# ── Helpers ───────────────────────────────────────────────────────────────────
def days_since(date_str: str) -> int:
    """How many days since a given date string."""
    if not date_str:
        return 999
    try:
        formats = ["%Y-%m-%d", "%Y-%m-%dT%H:%M:%S", "%Y-%m-%dT%H:%M:%S.%f"]
        for fmt in formats:
            try:
                dt = datetime.strptime(date_str[:19], fmt[:len(date_str[:19])])
                return (datetime.now() - dt).days
            except Exception:
                continue
        return 999
    except Exception:
        return 999

def days_until(date_str: str) -> int:
    """How many days until a given date string."""
    if not date_str:
        return 999
    try:
        dt = datetime.strptime(date_str[:10], "%Y-%m-%d")
        return (dt - datetime.now()).days
    except Exception:
        return 999

def haversine_distance(lat1, lon1, lat2, lon2) -> float:
    """Calculate distance in km between two coordinates."""
    try:
        R = 6371  # Earth radius in km
        lat1, lon1, lat2, lon2 = map(math.radians, [
            float(lat1), float(lon1), float(lat2), float(lon2)
        ])
        dlat = lat2 - lat1
        dlon = lon2 - lon1
        a = math.sin(dlat/2)**2 + math.cos(lat1) * math.cos(lat2) * math.sin(dlon/2)**2
        return R * 2 * math.asin(math.sqrt(a))
    except Exception:
        return 999.0

# ── CORE: Donor Priority Score (Rule-Based) ───────────────────────────────────
def calculate_priority_score(donor: dict, request: dict) -> float:
    """
    Calculate AI priority score for a donor against a blood request.

    Score = 40% Response Rate
          + 20% Donation Success
          + 20% Availability / Eligibility
          + 10% Distance
          + 10% Recency

    Returns score between 0.0 and 1.0
    """
    score = 0.0

    # ── 40% Response Rate ─────────────────────────────────────────────────────
    ratio = float(donor.get("calls_to_donations_ratio") or 0)
    # Lower ratio = better (fewer calls needed per donation)
    # ratio 0.1 = excellent (donated 10x for every call)
    # ratio 1.0 = average (1 call per donation)
    # ratio 5+ = poor (5+ calls per donation)
    if ratio == 0:
        response_score = 0.5  # Unknown history
    elif ratio <= 0.5:
        response_score = 1.0  # Excellent responder
    elif ratio <= 1.0:
        response_score = 0.8  # Good responder
    elif ratio <= 2.0:
        response_score = 0.5  # Average
    elif ratio <= 5.0:
        response_score = 0.3  # Poor
    else:
        response_score = 0.1  # Very poor (too many calls needed)
    score += 0.40 * response_score

    # ── 20% Donation Success (total donations) ────────────────────────────────
    total_donations = int(donor.get("donations_till_date") or 0)
    if total_donations == 0:
        donation_score = 0.3    # Never donated but registered
    elif total_donations == 1:
        donation_score = 0.5
    elif total_donations <= 3:
        donation_score = 0.7
    elif total_donations <= 7:
        donation_score = 0.85
    elif total_donations <= 15:
        donation_score = 0.95
    else:
        donation_score = 1.0    # Very experienced donor
    score += 0.20 * donation_score

    # ── 20% Availability / Eligibility ───────────────────────────────────────
    eligibility   = donor.get("eligibility_status", "").lower()
    active_status = donor.get("user_donation_active_status", "").lower()
    avail_emergency = donor.get("available_emergency", False)

    if eligibility == "eligible" and active_status == "active":
        avail_score = 1.0
    elif eligibility == "eligible":
        avail_score = 0.7
    elif active_status == "active":
        avail_score = 0.4
    else:
        avail_score = 0.1

    if avail_emergency:
        avail_score = min(1.0, avail_score + 0.1)

    score += 0.20 * avail_score

    # ── 10% Distance ─────────────────────────────────────────────────────────
    donor_lat  = donor.get("latitude") or donor.get("lat")
    donor_lng  = donor.get("longitude") or donor.get("lng")
    hosp_lat   = request.get("hospital_latitude")
    hosp_lng   = request.get("hospital_longitude")

    if all([donor_lat, donor_lng, hosp_lat, hosp_lng]):
        distance_km = haversine_distance(donor_lat, donor_lng, hosp_lat, hosp_lng)
        if distance_km <= 5:
            dist_score = 1.0
        elif distance_km <= 15:
            dist_score = 0.8
        elif distance_km <= 30:
            dist_score = 0.6
        elif distance_km <= 60:
            dist_score = 0.4
        elif distance_km <= 100:
            dist_score = 0.2
        else:
            dist_score = 0.1
    else:
        dist_score = 0.5  # Unknown distance

    score += 0.10 * dist_score

    # ── 10% Recency (last donation) ───────────────────────────────────────────
    last_donation = donor.get("last_donation_date", "")
    days_ago = days_since(last_donation)

    if days_ago == 999:
        recency_score = 0.3    # Never donated
    elif days_ago <= 90:
        recency_score = 0.0    # Too recent — not eligible yet
    elif days_ago <= 180:
        recency_score = 1.0    # Recently donated and recovered
    elif days_ago <= 365:
        recency_score = 0.8
    elif days_ago <= 730:
        recency_score = 0.6
    else:
        recency_score = 0.4    # Long time ago

    score += 0.10 * recency_score

    return round(score, 4)

# ── CORE: Match Donors to Request ────────────────────────────────────────────
def match_donors_to_request(
    request: dict,
    all_donors: list,
    top_primary: int = 5,
    top_backup: int = 10,
) -> dict:
    """
    Score all eligible donors and return top primary + backup donors.
    """

    blood_group  = request.get("blood_group", "")
    compatible   = get_compatible_blood_groups(blood_group)

    # Filter eligible donors with compatible blood group
    eligible = []
    for donor in all_donors:
        donor_bg = donor.get("blood_group", "")
        if donor_bg not in compatible:
            continue
        eligible.append(donor)

    if not eligible:
        return {
            "request_id":    request.get("request_id"),
            "blood_group":   blood_group,
            "total_eligible": 0,
            "primary_donors": [],
            "backup_donors":  [],
            "fulfillment_prediction": "low",
            "message": f"No eligible donors found for blood group {blood_group}",
        }

    # Score each donor
    scored = []
    for donor in eligible:
        s = calculate_priority_score(donor, request)
        scored.append({
            "donor_id":       donor.get("user_id"),
            "name":           donor.get("name", "Unknown"),
            "blood_group":    donor.get("blood_group"),
            "priority_score": s,
            "match_type":     "primary",
            "status":         "pending",
            "eligibility":    donor.get("eligibility_status"),
            "active_status":  donor.get("user_donation_active_status"),
            "donations":      donor.get("donations_till_date", 0),
            "city":           donor.get("city", ""),
            "mobile":         donor.get("mobile", ""),
        })

    # Sort by score descending
    scored.sort(key=lambda x: x["priority_score"], reverse=True)

    # Split into primary and backup
    primary = scored[:top_primary]
    backup  = scored[top_primary:top_primary + top_backup]
    for d in backup:
        d["match_type"] = "backup"

    # Predict fulfillment
    prediction = predict_fulfillment(primary, request)

    return {
        "request_id":             request.get("request_id"),
        "blood_group":            blood_group,
        "total_eligible":         len(eligible),
        "total_scored":           len(scored),
        "primary_donors":         primary,
        "backup_donors":          backup,
        "fulfillment_prediction": prediction,
        "matched_at":             datetime.now(timezone.utc).isoformat(),
    }

# ── Blood Group Compatibility ─────────────────────────────────────────────────
def get_compatible_blood_groups(required: str) -> list:
    """Return list of blood groups that can donate to required group."""
    compatibility = {
        "A+":  ["A+", "A-", "O+", "O-"],
        "A-":  ["A-", "O-"],
        "B+":  ["B+", "B-", "O+", "O-"],
        "B-":  ["B-", "O-"],
        "AB+": ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"],
        "AB-": ["A-", "B-", "AB-", "O-"],
        "O+":  ["O+", "O-"],
        "O-":  ["O-"],
    }
    # Also handle "A Positive" format
    normalized = {
        "A Positive": "A+", "A Negative": "A-",
        "B Positive": "B+", "B Negative": "B-",
        "AB Positive": "AB+", "AB Negative": "AB-",
        "O Positive": "O+", "O Negative": "O-",
    }
    required = normalized.get(required, required)
    return compatibility.get(required, [required])

# ── Fulfillment Prediction ────────────────────────────────────────────────────
def predict_fulfillment(primary_donors: list, request: dict) -> str:
    """Predict if request will be fulfilled: high / medium / low"""
    if not primary_donors:
        return "low"

    avg_score = sum(d["priority_score"] for d in primary_donors) / len(primary_donors)
    top_score = primary_donors[0]["priority_score"] if primary_donors else 0

    urgency = request.get("urgency", "medium")
    urgency_boost = {"critical": 0.1, "high": 0.05, "medium": 0, "low": -0.05}
    boost = urgency_boost.get(urgency, 0)

    adjusted = avg_score + boost

    if top_score >= 0.8 and adjusted >= 0.65:
        return "high"
    elif adjusted >= 0.45:
        return "medium"
    else:
        return "low"

# ── BEDROCK: AI Insights (Claude) ─────────────────────────────────────────────
def get_ai_insights(stats: dict) -> str:
    """
    Use Claude via Bedrock to generate coordinator insights.
    """
    try:
        prompt = f"""You are an AI assistant for Blood Warriors, a blood donation coordination platform for Thalassemia patients in India.

Here are the current platform statistics:
- Total Donors: {stats.get('total_donors', 0)}
- Eligible Donors: {stats.get('eligible_donors', 0)}
- Total Patients: {stats.get('total_patients', 0)}
- Total Blood Requests: {stats.get('total_requests', 0)}
- Fulfilled Requests: {stats.get('fulfilled_requests', 0)}
- Pending Requests: {stats.get('pending_requests', 0)}
- Active Requests: {stats.get('active_requests', 0)}

Please provide:
1. A brief assessment of the current situation (2-3 sentences)
2. Top 3 actionable recommendations for the coordinator
3. Any alerts or urgent actions needed

Keep it concise, practical, and focused on saving lives. Respond in plain text, no markdown."""

        body = json.dumps({
            "anthropic_version": "bedrock-2023-05-31",
            "max_tokens": 500,
            "messages": [
                {"role": "user", "content": prompt}
            ]
        })

        response = bedrock.invoke_model(
            modelId=MODEL_ID,
            body=body,
            contentType="application/json",
            accept="application/json",
        )

        result = json.loads(response["body"].read())
        return result["content"][0]["text"]

    except Exception as e:
        return f"AI insights temporarily unavailable. Error: {str(e)}"


def get_donor_engagement_message(donor: dict, request: dict) -> str:
    """
    Use Claude to generate a personalized donor outreach message.
    """
    try:
        prompt = f"""You are writing a blood donation request message for Blood Warriors platform.

Donor details:
- Name: {donor.get('name', 'Donor')}
- Blood Group: {donor.get('blood_group', '')}
- Total donations: {donor.get('donations_till_date', 0)}

Request details:
- Blood Group needed: {request.get('blood_group', '')}
- Hospital: {request.get('hospital', '')}
- Urgency: {request.get('urgency', 'medium')}
- Units needed: {request.get('units_required', 1)}

Write a short, warm, and motivating SMS message (max 160 characters) to this donor requesting their help.
Just write the message text, nothing else."""

        body = json.dumps({
            "anthropic_version": "bedrock-2023-05-31",
            "max_tokens": 100,
            "messages": [
                {"role": "user", "content": prompt}
            ]
        })

        response = bedrock.invoke_model(
            modelId=MODEL_ID,
            body=body,
            contentType="application/json",
            accept="application/json",
        )

        result = json.loads(response["body"].read())
        return result["content"][0]["text"]

    except Exception as e:
        # Fallback message if Bedrock fails
        return (
            f"Dear {donor.get('name', 'Donor')}, a Thalassemia patient urgently needs "
            f"{request.get('blood_group', '')} blood at {request.get('hospital', '')}. "
            f"Can you help? - Blood Warriors"
        )