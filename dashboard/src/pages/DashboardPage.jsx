import { useState, useEffect } from "react"
import { useNavigate } from 'react-router-dom'
import '../styles/DashboardPage.css'
import { apiFetch } from "../api/client"


export default function DashboardPage() {
//  const [health, setHealth] = useState(null);

//  useEffect(() => {
//        apiFetch("/health").then(setHealth).catch(console.error);
        
//  }, []);
  const [alerts, setAlerts] = useState([])
  const [loading, setLoading] = useState(false)
  const [audits, setAudits] = useState([])
  const navigate = useNavigate()

  // Mock states for the graph filters
  const [location, setLocation] = useState('All Sectors')
  const [timeRange, setTimeRange] = useState('Last 24 Hours')
  const [dataType, setDataType] = useState('Temperature')

  // Dummy data for the alerts section
  const recentAlerts = [
    { id: 1, time: "14:32", type: "Temp High", loc: "Block 38", desc: "Exceeds 85°C", level: "Critical" },
    { id: 2, time: "12:15", type: "Anomaly", loc: "Sector 4", desc: "Unusual power pattern", level: "High" },
    { id: 3, time: "10:45", type: "Humidity Low", loc: "Block 12", desc: "Dropped below 30%", level: "Medium" },
    { id: 4, time: "09:20", type: "Offline", loc: "Sensor 5", desc: "No data for 30m", level: "High" } 
  ]

  // Dummy data for audit logs
  const auditLogs = [
    "[10:05:12] SYSTEM: User 'admin' logged in successfully.",
    "[10:12:45] CONFIG: Threshold 'temp_max' updated to 85 by 'admin'.",
    "[11:30:02] ALERT: System automatically acknowledged low-priority ping.",
    "[12:15:43] ML_ENGINE: Anomaly detection model re-calibrated.",
    "[13:00:00] SYSTEM: Automated database backup completed.",
    "[14:35:10] USER: 'lporter' viewed alert #1 details.",
    "[15:22:01] SENSOR: Firmware update pushed to Sector 4."
  ]

  // Fetch alerts from backend
  const fetchAlerts = async () => {
    try {
      setLoading(true)
      const data = await apiFetch('/alerts')
      setAlerts(data) 
    } catch (error) {
      console.error('Error fetching dashboard alerts:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchAlerts()
  }, [])

  const fetchAudits = async () => {
    try {
      const audit_data = await apiFetch('/audits')
      setAudits(audit_data)
    } catch (error) {
      console.error('Error fetching system audits:', error)
    } finally {
      setLoading(false)
    }
  }

  const getSeverityClass = (severity) => {
    return `severity-${severity.toLowerCase()}`
  }

  const getMethodBadge = (method) => {
    return `method-${method.toLowerCase()}`
  }

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A'

    // Backend stores UTC without timezone suffix. Append Z so JS parses as UTC.
    const normalizedDateString =
      typeof dateString === 'string' && !/[zZ]|[+-]\d{2}:?\d{2}$/.test(dateString)
        ? `${dateString}Z`
        : dateString

    return new Date(normalizedDateString).toLocaleString('en-US', {
      timeZone: 'America/New_York',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      timeZoneName: 'short'
    })
  }

  return (
    <div className="dashboard-page">

      <div className="title">
        <h2>SCEMAS Dashboard</h2>
      </div>

      {/* TOP SECTION: Data Views */}
      <div className="data-section">
        <div className="data-visualization">
          <div className="graph-section">
             {/* Mockup of a Graph View */}
            <div className="graph-container">
                <span className="mock-graph-placeholder">(Graph View Placeholder)</span>
            </div>
          </div>  
          <div className="filter-options">
            <select value={location} onChange={(e) => setLocation(e.target.value)}>
              <option>All Sectors</option>
              <option>Block 38</option>
              <option>Sector 4</option>
            </select>
            <select value={dataType} onChange={(e) => setDataType(e.target.value)}>
              <option>Temperature</option>
              <option>Humidity</option>
              <option>Air Quality</option>
            </select>
            <select value={timeRange} onChange={(e) => setTimeRange(e.target.value)}>
              <option>Last 24 Hours</option>
              <option>Last 7 Days</option>
              <option>Last 30 Days</option>
            </select>
          </div>
        </div>
      </div>

      {/* BOTTOM SECTION: Split Layout */}
      <div className="bottom-panel">
        
        {/* Alerts Section */}
        <div className="alerts-and-buttons-section">
          <div className="alerts-title">
             <h2>Recent Alerts</h2>
          </div>
          <div className="alerts-list">
            {loading && <div className="loading">Loading alerts...</div>}

            {!loading && alerts.length === 0 && (
              <div className="no-alerts">
                <p>No alerts to display</p>
              </div>
            )}

            {alerts.map(alert => (
              <div key={alert.alert_id} className="alert-row">
                <span className="alert-time">{formatDate(alert.created_at)}</span>
                <span className="alert-type">{alert.alert_type}</span>
                <span className="alert-desc">{alert.alert_description}</span>
                <span className={`alert-method method-${alert.alert_method}`}>{alert.alert_method}</span>
                <span className={`alert-severity level-${alert.alert_severity}`}>{alert.alert_severity}</span>
              </div>
            ))}
          </div>
          <div className="buttons">
            <button 
              className="btn-primary full-width" 
              onClick={() => navigate('/alerts')}
            >
              Manage Alerts
            </button>
            <button className="btn-secondary">Edit Alert Thresholds</button>
            <button className="btn-secondary">View System Health</button>
          </div>
        </div>

        {/* Audit Logs Section */}
        <div className="audit-section">
          <div className="audit-title">
             <h2>System Audits</h2>
          </div>
          <div className="log-container">
            {auditLogs.map((log, index) => (
              <div key={index} className="log-entry">
                {log}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

