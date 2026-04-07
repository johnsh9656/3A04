from flask import Blueprint, jsonify, request
from database import delete, get_all, insert
from datetime import datetime

iot_bp = Blueprint('iot', __name__)

# Add an IoT device to the system
@iot_bp.route("/devices", methods=["POST"])
def create_device():
    data = request.get_json()
    required_fields = ["location", "longitude", "latitude"]

    # Check for missing fields
    for field in required_fields:
        if field not in data:
            return jsonify({"error": "Missing required fields"}), 400
        
    # New device data
    new_device = {
        "location": data["location"],
        "longitude": data["longitude"],
        "latitude": data["latitude"],
        "created_at": datetime.now().isoformat()
    }
    device = insert("devices", new_device)
    return jsonify(device)

# Remove IoT device from the system
@iot_bp.route("/devices/<int:device_id>", methods=["DELETE"])
def remove_device(device_id):
    if delete("devices", device_id):
        return jsonify({"message": "Device deleted successfully"})
    else:
        return jsonify({"error": "Device not found"}), 404