import random
import time
import threading
from datetime import datetime
from database import insert
from alert_service import create_alert

class TelemetrySimulator:
    def __init__(self, interval=10, anomaly_probability=0.2, thresholds=None):
        self.interval = interval  # Seconds between insertions
        self.anomaly_probability = anomaly_probability  # Probability of generating an anomaly (0.0 to 1.0)
        self.thresholds = thresholds or {}  # Thresholds dictionary from app.py
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
        
        telemetry_data = {"device_id": device_id}
        
        # Decide if this telemetry entry should have an anomaly
        has_anomaly = random.random() < self.anomaly_probability
        
        # If anomaly, pick a random metric to violate
        anomaly_metric = None
        if has_anomaly:
            anomaly_metric = random.choice(list(self.thresholds.keys()))
        
        for metric in self.thresholds.keys():
            thresh_min = self.thresholds[metric].get("min")
            thresh_max = self.thresholds[metric].get("max")
            
            if metric == anomaly_metric:
                # Generate anomaly: violate min or max
                if random.choice([True, False]):
                    # Violate max
                    value = round(random.uniform(thresh_max + 1, thresh_max + 50), 1)
                else:
                    # Violate min
                    value = round(random.uniform(thresh_min - 50, thresh_min - 1), 1)
            else:
                # Normal value within threshold range
                value = round(random.uniform(thresh_min, thresh_max), 1)
            
            telemetry_data[metric] = value
        
        # Add timestamp
        telemetry_data["created_at"] = datetime.now().isoformat()
        
        # Insert into database
        try:
            inserted = insert("telemetry", telemetry_data)
            telemetry_id = inserted.get("telemetry_id")
            print(f"Inserted telemetry: {inserted}")
            
            # Check for threshold violations and create alerts if needed
            self._check_thresholds_and_create_alerts(inserted, device_id, telemetry_id)
        except Exception as e:
            print(f"Error inserting telemetry: {e}")

    def _check_thresholds_and_create_alerts(self, telemetry_data, device_id, telemetry_id):
        """Check if any telemetry value exceeds thresholds and create alerts."""
        for metric in self.thresholds.keys():
            value = telemetry_data.get(metric)
            if value is None:
                continue
            
            thresh_min = self.thresholds[metric].get("min")
            thresh_max = self.thresholds[metric].get("max")
            
            # Check if value violates threshold
            if value < thresh_min or value > thresh_max:
                # Determine severity based on how far it exceeds the threshold
                if value > thresh_max:
                    deviation = value - thresh_max
                else:
                    deviation = thresh_min - value
                
                # Severity logic: higher deviation = higher severity
                if deviation > 50:
                    severity = "critical"
                elif deviation > 25:
                    severity = "high"
                else:
                    severity = "medium"
                
                alert_description = f"{metric.replace('_', ' ').title()} value {value} exceeded threshold (min: {thresh_min}, max: {thresh_max})."
                
                try:
                    alert = create_alert(
                        device_id=device_id,
                        telemetry_id=telemetry_id,
                        alert_type=metric.replace('_', ' ').title(),
                        alert_severity=severity,
                        alert_description=alert_description,
                        alert_method="threshold"
                    )
                    print(f"Created alert: {alert}")
                except Exception as e:
                    print(f"Error creating alert: {e}")