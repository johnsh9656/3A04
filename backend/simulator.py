import random
import time
import threading
from datetime import datetime
from database import insert

class TelemetrySimulator:
    def __init__(self, interval=10):
        self.interval = interval  # Seconds between insertions
        self.running = False
        self.thread = None

    def start(self):
        if self.running:
            print("Simulator is already running.")
            return
        self.running = True
        self.thread = threading.Thread(target=self._run, daemon=True)
        self.thread.start()
        print("Telemetry simulator started.")

    def stop(self):
        self.running = False
        if self.thread:
            self.thread.join()
        print("Telemetry simulator stopped.")

    def _run(self):
        while self.running:
            self._generate_and_insert_telemetry()
            time.sleep(self.interval)

    def _generate_and_insert_telemetry(self):
        # Randomly select a device ID (1-5 based on devices.json)
        device_id = random.randint(1, 5)
        
        # Generate random telemetry values
        temperature = round(random.uniform(10.0, 35.0), 1)  # 10-35°C
        humidity = round(random.uniform(30.0, 80.0), 1)     # 30-80%
        air_quality = round(random.uniform(30.0, 150.0), 1)  # 30-150
        noise_level = round(random.uniform(40.0, 100.0), 1)  # 40-100
        
        # Create telemetry entry
        telemetry_entry = {
            "device_id": device_id,
            "temperature": temperature,
            "humidity": humidity,
            "air_quality": air_quality,
            "noise_level": noise_level,
            "created_at": datetime.utcnow().isoformat()
        }
        
        # Insert into database
        try:
            inserted = insert("telemetry", telemetry_entry)
            print(f"Inserted telemetry: {inserted}")
        except Exception as e:
            print(f"Error inserting telemetry: {e}")