from flask import Flask, jsonify, request
from flask_cors import CORS
from database import get_all
from alert_service import get_all_alerts, get_alert_by_id, get_alerts_by_device_id, get_unacknowledged_alerts, create_alert, acknowledge_alert, unacknowledge_alert
from routes.iot_routes import iot_bp
from routes.telemetry_routes import telemetry_bp
from rest_api_management import verify_public_api_key, get_non_sensitive_public_data, enforce_rate_limit
from audit_log_service import get_all_audit_logs, get_audit_log_by_id, get_audit_logs_by_user

app = Flask(__name__)
CORS(app)

# Register blueprints
app.register_blueprint(iot_bp)
app.register_blueprint(telemetry_bp)

@app.route('/health', methods=['GET'])
def health():
    return jsonify({'status': 'ok'})

# get all devices
@app.route("/devices", methods=["GET"])
def get_devices():
    return jsonify(get_all("devices"))



# ALERT ENDPOINTS
# get all alerts
@app.route("/alerts", methods=["GET"])
def get_alerts():
    return jsonify(get_all_alerts())

# get alerts by alert ID
@app.route("/alerts/<int:alert_id>", methods=["GET"])
def get_alert(alert_id):
    alert = get_alert_by_id(alert_id)
    if alert:
        return jsonify(alert)
    else:
        return jsonify({"error": "Alert not found"}), 404

# get alerts by device ID
@app.route("/alerts/devices/<int:device_id>", methods=["GET"])
def get_alerts_by_device(device_id):
    alerts = get_alerts_by_device_id(device_id)
    if alerts:
        return jsonify(alerts)
    else:        
        return jsonify({"error": "No alerts found for this device"}), 404

# create alert
@app.route("/alerts", methods=["POST"])
def create_new_alert():
    data = request.get_json()
    required_fields = ["device_id", "alert_type", "alert_severity", "alert_description", "alert_method"]

    if not all(field in data for field in required_fields):
        return jsonify({"error": "Missing required fields"}), 400\
    
    alert = create_alert(
        device_id=data["device_id"],
        telemetry_id=data.get("telemetry_id"),
        alert_type=data["alert_type"],
        alert_severity=data["alert_severity"],
        alert_description=data["alert_description"],
        alert_method=data["alert_method"]
    )

    return jsonify(alert)

# acknowledge alert
@app.route("/alerts/<int:alert_id>/acknowledge", methods=["POST"])
def acknowledge_existing_alert(alert_id):
    try:
        alert = acknowledge_alert(alert_id)
        return jsonify(alert)
    except ValueError as e:
        return jsonify({"error": str(e)}), 404
    
# unacknowledge alert
@app.route("/alerts/<int:alert_id>/unacknowledge", methods=["POST"])
def unacknowledge_existing_alert(alert_id):
    try:
        alert = unacknowledge_alert(alert_id)
        return jsonify(alert)
    except ValueError as e:
        return jsonify({"error": str(e)}), 404

# Rest API
# get non-sensitive telemetry data (public endpoint, requires API key)
@app.route("/public_telemetry", methods=["GET"])
def get_telemetry():
    api_key_found, error = verify_public_api_key()
    if error:
        payload, status = error
        return jsonify(payload), status
    
    allowed, retry = enforce_rate_limit(f"{api_key_found}")
    if not allowed:
        return jsonify({"error": "Rate limit exceeded", "retry_after_seconds": retry}), 429
    
    public_data = get_non_sensitive_public_data()
    return jsonify(public_data)

# AUDIT LOG ENDPOINTS
# get all audit logs
@app.route("/audit_log", methods=["GET"])
def get_audit_logs():
    return jsonify(get_all_audit_logs())

# get audit log by log ID
@app.route("/audit_log/<int:audit_id>", methods=["GET"])
def get_audit_log(audit_id):
    audit_log = get_audit_log_by_id(audit_id)
    if not audit_log:
        return jsonify({"error": "Audit log not found"}), 404
        
    return jsonify(audit_log)

# get audit logs by user
@app.route("/audit_log/users/<user>", methods=["GET"])
def get_audit_logs_for_specific_user(user):
    audit_logs = get_audit_logs_by_user(user)
    if not audit_logs:
        return jsonify({"error": "No audit logs found for this user"}), 404
    
    return jsonify(audit_logs)

if __name__ == '__main__':
    app.run(debug=True)