from flask import Flask, jsonify, request
from flask_cors import CORS
from database import get_all

app = Flask(__name__)
CORS(app)

@app.route('/api/health', methods=['GET'])
def health():
    return jsonify({'status': 'ok'})

# get all devices
@app.route("/devices", methods=["GET"])
def get_devices():
    return jsonify(get_all("devices"))


if __name__ == '__main__':
    app.run(debug=True)