from database import get_all, get_by_id, find_many, insert, update
from datetime import datetime

VALID_SEVERITIES = {"low", "medium", "high"}
VALID_METHODS = {"threshold", "ml"}

def get_all_alerts():
    alerts = get_all("alerts")
    return sorted(alerts, key=lambda x: x["created_at"], reverse=True)

def get_alert_by_id(alert_id: int):
    return get_by_id("alerts", alert_id)

def get_alerts_by_device_id(device_id: int):
    return find_many("alerts", device_id=device_id)

def get_unacknowledged_alerts():
    return find_many("alerts", acknowledged=False)

def create_alert(
    device_id: int,
    telemetry_id: int | None,
    alert_type: str,
    alert_severity: str,
    alert_description: str,
    alert_method: str
):
    if alert_severity not in VALID_SEVERITIES:
        raise ValueError(f"Invalid alert severity. Must be one of {VALID_SEVERITIES}")
    if alert_method not in VALID_METHODS:
        raise ValueError(f"Invalid alert method. Must be one of {VALID_METHODS}")

    new_alert = {
        "device_id": device_id,
        "telemetry_id": telemetry_id,
        "alert_type": alert_type,
        "alert_severity": alert_severity,
        "alert_description": alert_description,
        "alert_method": alert_method,
        "acknowledged": False,
        "created_at": datetime.now().isoformat(),
        "acknowledged_at": None
    }
    return insert("alerts", new_alert)

def acknowledge_alert(alert_id: int):
    alert = get_by_id("alerts", alert_id)
    if not alert:
        raise ValueError(f"Alert with ID {alert_id} not found.")
    
    if alert["acknowledged"]:
        return alert  # Already acknowledged, no update needed
    
    updates = {
        "acknowledged": True,
        "acknowledged_at": datetime.now().isoformat()
    }
    return update("alerts", alert_id, updates)

def unacknowledge_alert(alert_id: int):
    alert = get_by_id("alerts", alert_id)
    if not alert:
        raise ValueError(f"Alert with ID {alert_id} not found.")
    
    if not alert["acknowledged"]:
        return alert  # Already unacknowledged, no update needed
    
    updates = {
        "acknowledged": False,
        "acknowledged_at": None
    }
    return update("alerts", alert_id, updates)