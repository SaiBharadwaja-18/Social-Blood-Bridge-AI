"""
Blood Bridge AI — Auth Routes
POST /auth/register
POST /auth/login
GET  /auth/me
"""

from fastapi import APIRouter, HTTPException, Header
from pydantic import BaseModel, EmailStr
from typing import Optional
import hashlib
import uuid
from datetime import datetime, timezone, timedelta
from jose import jwt

from services.dynamodb import (
    get_user_by_email,
    get_user_by_id,
    create_user,
)

# ── Config ────────────────────────────────────────────────────────────────────
SECRET_KEY = "blood-bridge-ai-secret-2025"
ALGORITHM  = "HS256"
TOKEN_EXPIRE_HOURS = 24

router = APIRouter(prefix="/auth", tags=["Authentication"])

# ── Helpers ───────────────────────────────────────────────────────────────────
def hash_password(password: str) -> str:
    return hashlib.sha256(password.encode()).hexdigest()

def verify_password(password: str, hashed: str) -> bool:
    return hash_password(password) == hashed

def create_token(user_id: str, role: str) -> str:
    expire = datetime.now(timezone.utc) + timedelta(hours=TOKEN_EXPIRE_HOURS)
    payload = {
        "sub":  user_id,
        "role": role,
        "exp":  expire,
    }
    return jwt.encode(payload, SECRET_KEY, algorithm=ALGORITHM)

def decode_token(token: str) -> dict:
    try:
        return jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
    except Exception:
        raise HTTPException(status_code=401, detail="Invalid or expired token")

def get_current_user(authorization: str = Header(None)):
    if not authorization or not authorization.startswith("Bearer "):
        raise HTTPException(status_code=401, detail="Authorization header missing")
    token = authorization.split(" ")[1]
    payload = decode_token(token)
    user = get_user_by_id(payload["sub"])
    if not user:
        raise HTTPException(status_code=401, detail="User not found")
    return user

# ── Schemas ───────────────────────────────────────────────────────────────────
class DonorRegisterRequest(BaseModel):
    name:               str
    email:              str
    mobile:             str
    password:           str
    blood_group:        str
    gender:             str
    city:               str
    state:              str
    latitude:           Optional[float] = None
    longitude:          Optional[float] = None
    dob:                Optional[str]   = None
    donated_before:     Optional[bool]  = False
    last_donation_date: Optional[str]   = None
    available_emergency: Optional[bool] = True
    has_health_issues:  Optional[bool]  = False
    health_description: Optional[str]   = None
    on_medication:      Optional[bool]  = False
    feeling_healthy:    Optional[bool]  = True
    consent_notifications: Optional[bool] = True
    consent_accurate:   Optional[bool]  = True

class PatientRegisterRequest(BaseModel):
    name:                    str
    email:                   str
    mobile:                  str
    password:                str
    blood_group:             str
    gender:                  str
    age:                     int
    city:                    str
    state:                   str
    latitude:                Optional[float] = None
    longitude:               Optional[float] = None
    hospital_name:           Optional[str]   = None
    hospital_location:       Optional[str]   = None
    hospital_latitude:       Optional[float] = None
    hospital_longitude:      Optional[float] = None
    condition:               Optional[str]   = "Thalassemia"
    emergency_contact_name:  Optional[str]   = None
    emergency_contact_number: Optional[str]  = None
    regular_transfusions:    Optional[bool]  = True
    expected_requirement:    Optional[str]   = None
    consent_share:           Optional[bool]  = True
    consent_accurate:        Optional[bool]  = True

class LoginRequest(BaseModel):
    email:    str
    password: str

# ── Routes ────────────────────────────────────────────────────────────────────

@router.post("/register/donor")
def register_donor(data: DonorRegisterRequest):
    # Check if email already exists
    existing = get_user_by_email(data.email)
    if existing:
        raise HTTPException(status_code=400, detail="Email already registered")

    user_data = {
        "user_id":               str(uuid.uuid4()),
        "role":                  "donor",
        "name":                  data.name,
        "email":                 data.email.lower(),
        "mobile":                data.mobile,
        "password_hash":         hash_password(data.password),
        "blood_group":           data.blood_group,
        "gender":                data.gender,
        "city":                  data.city,
        "state":                 data.state,
        "latitude":              data.latitude,
        "longitude":             data.longitude,
        "dob":                   data.dob,
        "donated_before":        data.donated_before,
        "last_donation_date":    data.last_donation_date or "",
        "available_emergency":   data.available_emergency,
        "has_health_issues":     data.has_health_issues,
        "health_description":    data.health_description or "",
        "on_medication":         data.on_medication,
        "feeling_healthy":       data.feeling_healthy,
        "consent_notifications": data.consent_notifications,
        "consent_accurate":      data.consent_accurate,
        "eligibility_status":    "eligible",
        "donations_till_date":   0,
        "total_calls":           0,
        "calls_to_donations_ratio": 0.0,
        "user_donation_active_status": "Active",
        "donor_type":            "One-Time Donor",
        "registration_date":     datetime.now(timezone.utc).isoformat(),
    }

    user_id = create_user(user_data)
    token   = create_token(user_id, "donor")

    return {
        "success": True,
        "message": "Donor registered successfully",
        "token":   token,
        "user": {
            "user_id":     user_id,
            "name":        data.name,
            "email":       data.email,
            "role":        "donor",
            "blood_group": data.blood_group,
        }
    }


@router.post("/register/patient")
def register_patient(data: PatientRegisterRequest):
    existing = get_user_by_email(data.email)
    if existing:
        raise HTTPException(status_code=400, detail="Email already registered")

    user_id = str(uuid.uuid4())

    user_data = {
        "user_id":                  user_id,
        "role":                     "patient",
        "name":                     data.name,
        "email":                    data.email.lower(),
        "mobile":                   data.mobile,
        "password_hash":            hash_password(data.password),
        "blood_group":              data.blood_group,
        "gender":                   data.gender,
        "age":                      data.age,
        "city":                     data.city,
        "state":                    data.state,
        "latitude":                 data.latitude,
        "longitude":                data.longitude,
        "hospital_name":            data.hospital_name or "",
        "hospital_location":        data.hospital_location or "",
        "hospital_latitude":        data.hospital_latitude,
        "hospital_longitude":       data.hospital_longitude,
        "condition":                data.condition,
        "emergency_contact_name":   data.emergency_contact_name or "",
        "emergency_contact_number": data.emergency_contact_number or "",
        "regular_transfusions":     data.regular_transfusions,
        "expected_requirement":     data.expected_requirement or "",
        "consent_share":            data.consent_share,
        "consent_accurate":         data.consent_accurate,
        "registration_date":        datetime.now(timezone.utc).isoformat(),
    }

    create_user(user_data)
    token = create_token(user_id, "patient")

    return {
        "success": True,
        "message": "Patient registered successfully",
        "token":   token,
        "user": {
            "user_id":     user_id,
            "name":        data.name,
            "email":       data.email,
            "role":        "patient",
            "blood_group": data.blood_group,
        }
    }


@router.post("/login")
def login(data: LoginRequest):
    # Find user by email
    user = get_user_by_email(data.email.lower())
    if not user:
        raise HTTPException(status_code=401, detail="Invalid email or password")

    # Verify password
    if not verify_password(data.password, user.get("password_hash", "")):
        raise HTTPException(status_code=401, detail="Invalid email or password")

    # Create token
    token = create_token(user["user_id"], user["role"])

    # Remove sensitive fields
    user.pop("password_hash", None)

    return {
        "success": True,
        "message": "Login successful",
        "token":   token,
        "user":    user,
    }


@router.get("/me")
def get_me(authorization: str = Header(None)):
    user = get_current_user(authorization)
    user.pop("password_hash", None)
    return {
        "success": True,
        "user":    user,
    }