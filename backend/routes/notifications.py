"""
Blood Bridge AI — Notifications Routes
GET  /notifications
PUT  /notifications/{notification_id}/read
PUT  /notifications/read-all
POST /notifications/send
"""

from fastapi import APIRouter, HTTPException, Header
from pydantic import BaseModel
from typing import Optional

from services.dynamodb import (
    get_notifications_by_user,
    create_notification,
    mark_notification_read,
    get_user_by_id,
    get_all_donors,
    get_request_by_id,
)
from routes.auth import get_current_user

router = APIRouter(prefix="/notifications", tags=["Notifications"])

# ── Schemas ───────────────────────────────────────────────────────────────────
class SendNotificationSchema(BaseModel):
    user_id:            Optional[str] = None   # specific user
    blood_group:        Optional[str] = None   # broadcast to blood group
    title:              str
    message:            str
    notif_type:         Optional[str] = "system"
    related_request_id: Optional[str] = ""

# ── Routes ────────────────────────────────────────────────────────────────────

@router.get("")
def get_my_notifications(authorization: str = Header(None)):
    """Get notifications for the logged-in user."""
    current_user = get_current_user(authorization)
    user_id      = current_user["user_id"]

    notifications = get_notifications_by_user(user_id)

    return {
        "success":       True,
        "user_id":       user_id,
        "total":         len(notifications),
        "unread_count":  len([n for n in notifications if not n.get("read")]),
        "notifications": notifications,
    }


@router.put("/{notification_id}/read")
def mark_read(notification_id: str, authorization: str = Header(None)):
    """Mark a single notification as read."""
    get_current_user(authorization)

    mark_notification_read(notification_id)

    return {
        "success": True,
        "message": "Notification marked as read",
    }


@router.put("/read-all")
def mark_all_read(authorization: str = Header(None)):
    """Mark all notifications as read for current user."""
    current_user  = get_current_user(authorization)
    notifications = get_notifications_by_user(current_user["user_id"])

    count = 0
    for n in notifications:
        if not n.get("read"):
            mark_notification_read(n["notification_id"])
            count += 1

    return {
        "success": True,
        "message": f"{count} notifications marked as read",
        "count":   count,
    }


@router.post("/send")
def send_notification(
    data: SendNotificationSchema,
    authorization: str = Header(None),
):
    """
    Send notification — coordinator only.
    Can send to:
    - A specific user (user_id)
    - All donors with a specific blood group (blood_group)
    - All donors (neither specified)
    """
    current_user = get_current_user(authorization)
    if current_user["role"] != "coordinator":
        raise HTTPException(status_code=403, detail="Coordinators only")

    sent_to = []

    if data.user_id:
        # Send to specific user
        user = get_user_by_id(data.user_id)
        if not user:
            raise HTTPException(status_code=404, detail="User not found")

        create_notification(
            user_id=data.user_id,
            title=data.title,
            message=data.message,
            notif_type=data.notif_type,
            related_request_id=data.related_request_id or "",
        )
        sent_to.append(data.user_id)

    elif data.blood_group:
        # Broadcast to all donors with matching blood group
        donors = get_all_donors(blood_group=data.blood_group)
        for donor in donors:
            create_notification(
                user_id=donor["user_id"],
                title=data.title,
                message=data.message,
                notif_type=data.notif_type,
                related_request_id=data.related_request_id or "",
            )
            sent_to.append(donor["user_id"])

    else:
        # Broadcast to ALL donors
        donors = get_all_donors()
        for donor in donors:
            create_notification(
                user_id=donor["user_id"],
                title=data.title,
                message=data.message,
                notif_type=data.notif_type,
                related_request_id=data.related_request_id or "",
            )
            sent_to.append(donor["user_id"])

    return {
        "success":    True,
        "message":    f"Notification sent to {len(sent_to)} user(s)",
        "sent_count": len(sent_to),
    }


@router.get("/summary")
def notifications_summary(authorization: str = Header(None)):
    """Get notification summary for current user."""
    current_user  = get_current_user(authorization)
    notifications = get_notifications_by_user(current_user["user_id"])

    unread    = [n for n in notifications if not n.get("read")]
    requests  = [n for n in notifications if n.get("type") == "request"]
    reminders = [n for n in notifications if n.get("type") == "reminder"]
    system    = [n for n in notifications if n.get("type") == "system"]

    return {
        "success": True,
        "summary": {
            "total":          len(notifications),
            "unread":         len(unread),
            "by_type": {
                "request":  len(requests),
                "reminder": len(reminders),
                "system":   len(system),
            },
        },
        "recent": notifications[:5],
    }