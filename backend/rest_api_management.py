from database import find_many, find_one, get_all
from flask import request, jsonify
from time import time

# Tracks API request timestamps for rate limiting
request_history = {}

# To simulate an API request open a new terminal while in the backend directory and run:
# curl.exe -i -H "X-API-Key: api_key from user.json" http://127.0.0.1:5000/telemetry?locati
def api_request_location():
    return request.args.get('location')

def api_request_api_key():
    return request.headers.get('X-API-Key')

def get_user_by_api_key(api_key):
    return find_one('users', api_key=api_key)

# Verifies if the API key provided in the request header is valid, otherwise returns an error message and status code
def verify_public_api_key():
    public_user_api_key = api_request_api_key()
    
    if not public_user_api_key:
        return None, ({"error": "Missing API key"}, 401)

    api_key_found = get_user_by_api_key(public_user_api_key)
    if not api_key_found:
        return None, ({"error": "Invalid or unauthorized API key"}, 403)

    return api_key_found, None

# Gets location for a given telemetry record by finding the corresponding device and returning its location
def get_corresponding_location_for_telemetry(telemetry):
    device_id = telemetry.get("device_id")
    device = find_one("devices", device_id=device_id)
    if not device:
        return None
    return device.get("location")

# Retrieves telemetry data based on the location provided in the API request
# Returns the most recent telemetry data along with its corresponding location
def find_telemetry_with_location_in_api_request(location):
    device_associated_to_location = find_one("devices", location=location)
    
    if not device_associated_to_location:
        return ({"error": "No device found at the specified location"}, 404)
    device_id = device_associated_to_location.get('device_id')
    
    telemetry_data = find_many('telemetry', device_id=device_id)
    if not telemetry_data:
        return ({"error": "No telemetry data found for the device at the specified location"}, 404)
    
    most_recent_telemetry_from_location = sorted(telemetry_data, key=lambda x: x["created_at"], reverse=True)[0]

    return most_recent_telemetry_from_location, location

# Retrieves the most recent telemetry data when no location is provided in the API request
# Returns the most recent telemetry data along with its corresponding location
def find_telemetry_without_location_in_api_request():
    most_recent_telemetry = get_all('telemetry')
    most_recent_telemetry = sorted(most_recent_telemetry, key=lambda x: x["created_at"], reverse=True)[0]
    location = get_corresponding_location_for_telemetry(most_recent_telemetry)
    return most_recent_telemetry, location

# Gets telemetry data based on the presence of location in the API request
def get_telemetry():
    location = api_request_location()
    if location:
        return find_telemetry_with_location_in_api_request(location)
    else:
        return find_telemetry_without_location_in_api_request()

# Restricts the telemetry data to only include non-sensitive information for public API requests
def get_non_sensitive_public_data():
    retrieved_telemetry, location = get_telemetry()
    return {
        "location": location,
        "air_quality": retrieved_telemetry["air_quality"]
    }

# Enforces a simple rate limit of 5 requests per minute for a given api key
def enforce_rate_limit(key, max_requests=5, window=60):
    now = time()
    history = request_history.get(key, [])
    history = [ts for ts in history if ts > now - window]
    if len(history) >= max_requests:
        retry_after = int(window - (now - history[0]))
        return False, retry_after
    history.append(now)
    request_history[key] = history
    return True, None   

    
