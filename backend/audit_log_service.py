from database import find_many, find_one, get_all, get_by_id

def get_all_audit_logs():
    audit_logs = get_all("audit")
    return sorted(audit_logs, key=lambda x: x["created_at"], reverse=True)

def get_audit_log_by_id(audit_id: int):
    return get_by_id("audit", audit_id)

def get_audit_logs_by_user(user: str):
    return find_many("audit", user=user)
