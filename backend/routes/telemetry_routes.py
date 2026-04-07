from flask import Blueprint, jsonify, request
from database import delete, get_all, get_by_id, insert
from datetime import datetime, timedelta

telemetry_bp = Blueprint('telemetry', __name__)

# Get all telemetry data
@telemetry_bp.route("/telemetry", methods=["GET"])
def get_all_telemetry():
    return jsonify(get_all("telemetry"))

# Get all telemetry data from the last 5 minutes
@telemetry_bp.route("/telemetry/recent", methods=["GET"])
def get_recent_telemetry():
    all_telemetry = get_all("telemetry")
    now = datetime.now().isoformat()
    five_mins_ago = now - timedelta(minutes=5)
    
    recent_telemetry = []
    for entry in all_telemetry:
        entry_time = datetime.fromisoformat(entry["created_at"])
        if entry_time >= five_mins_ago:
            recent_telemetry.append(entry)

    return jsonify(recent_telemetry)

# Get locations of devices that sent telemetry in the last 5 minutes
@telemetry_bp.route("/telemetry/recent/locations", methods=["GET"])
def get_recent_telemetry_locations():
    all_telemetry = get_all("telemetry")
    now = datetime.now().isoformat()
    five_mins_ago = now - timedelta(minutes=5)
    
    locations = set()  # Set to avoid duplicates
    for entry in all_telemetry:
        entry_time = datetime.fromisoformat(entry["created_at"])
        if entry_time >= five_mins_ago:
            device = get_by_id("devices", entry["device_id"])
            if device:
                locations.add(device["location"])
    
    return jsonify(list(locations))  # Returns as a list

# Get timestamps of telemetry entries from the last 5 minutes
@telemetry_bp.route("/telemetry/recent/times", methods=["GET"])
def get_recent_telemetry_times():
    all_telemetry = get_all("telemetry")
    now = datetime.now().isoformat()
    five_mins_ago = now - timedelta(minutes=5)
    
    times = []
    for entry in all_telemetry:
        entry_time = datetime.fromisoformat(entry["created_at"])
        if entry_time >= five_mins_ago:
            times.append(entry["created_at"])
    
    return jsonify(times)

# Get humidity values from telemetry entries in the last 5 minutes
@telemetry_bp.route("/telemetry/recent/humidity", methods=["GET"])
def get_recent_humidity():
    all_telemetry = get_all("telemetry")
    now = datetime.now().isoformat()
    five_mins_ago = now - timedelta(minutes=5)
    
    humidity_values = []
    for entry in all_telemetry:
        entry_time = datetime.fromisoformat(entry["created_at"])
        if entry_time >= five_mins_ago:
            humidity_values.append(entry["humidity"])

    return jsonify(humidity_values)

# Get air quality values from telemetry entries in the last 5 minutes
@telemetry_bp.route("/telemetry/recent/air_quality", methods=["GET"])
def get_recent_air_quality():
    all_telemetry = get_all("telemetry")
    now = datetime.now().isoformat()
    five_mins_ago = now - timedelta(minutes=5)
    
    air_quality_values = []
    for entry in all_telemetry:
        entry_time = datetime.fromisoformat(entry["created_at"])
        if entry_time >= five_mins_ago:
            air_quality_values.append(entry["air_quality"])
    
    return jsonify(air_quality_values)

# Get noise level values from telemetry entries in the last 5 minutes
@telemetry_bp.route("/telemetry/recent/noise_level", methods=["GET"])
def get_recent_noise_level():
    all_telemetry = get_all("telemetry")
    now = datetime.now().isoformat()
    five_mins_ago = now - timedelta(minutes=5)
    
    noise_level_values = []
    for entry in all_telemetry:
        entry_time = datetime.fromisoformat(entry["created_at"])
        if entry_time >= five_mins_ago:
            noise_level_values.append(entry["noise_level"])
    
    return jsonify(noise_level_values)

# Get temperature values from telemetry entries in the last 5 minutes
@telemetry_bp.route("/telemetry/recent/temperature", methods=["GET"])
def get_recent_temperature():
    all_telemetry = get_all("telemetry")
    now = datetime.now().isoformat()
    five_mins_ago = now - timedelta(minutes=5)
    
    temperature_values = []
    for entry in all_telemetry:
        entry_time = datetime.fromisoformat(entry["created_at"])
        if entry_time >= five_mins_ago:
            temperature_values.append(entry["temperature"])
    
    return jsonify(temperature_values)
