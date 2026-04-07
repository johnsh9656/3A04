import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import '../styles/Alerts.css'
import { apiFetch } from '../api/client'

/*
fetch alerts from backend and display them here in list form (most recent first)
each alert should show:
- alert_type
- alert_severity
- alert_description
- created_at
- acknowledged (if acknowledged, also show acknowledged_at)
there should be visual indication of severity, whether it's acknowledged, and whether it's a threshold or ml alert
also need button to return to dashboard view
*/

const Alerts = () => {
  const [alerts, setAlerts] = useState([])
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()

  // Dummy alert data for development
  const dummyAlerts = [
    {
      alert_id: 1,
      alert_type: "Temperature High",
      alert_severity: "critical",
      alert_description: "Temperature sensor reading exceeds maximum threshold of 85°C",
      alert_method: "threshold",
      acknowledged: false,
      created_at: "2026-03-31T14:32:15",
      acknowledged_at: null
    },
    {
      alert_id: 2,
      alert_type: "Anomaly Detected",
      alert_severity: "high",
      alert_description: "Unusual pattern detected in power consumption data",
      alert_method: "ml",
      acknowledged: true,
      created_at: "2026-03-31T12:15:42",
      acknowledged_at: "2026-03-31T13:00:00"
    },
    {
      alert_id: 3,
      alert_type: "Humidity Low",
      alert_severity: "medium",
      alert_description: "Humidity level dropped below 30%",
      alert_method: "threshold",
      acknowledged: false,
      created_at: "2026-03-31T10:45:22",
      acknowledged_at: null
    },
    {
      alert_id: 4,
      alert_type: "Device Offline",
      alert_severity: "high",
      alert_description: "Sensor device #5 has not reported data for 30 minutes",
      alert_method: "threshold",
      acknowledged: true,
      created_at: "2026-03-30T18:20:11",
      acknowledged_at: "2026-03-30T19:15:30"
    }
  ]

  const fetchAlerts = async () => {
    try {
      setLoading(true)
      const data = await apiFetch('/alerts')
      setAlerts(data)
    } catch (error) {
      console.error('Error fetching alerts:', error)
      // Fall back to dummy data on error
      setAlerts(dummyAlerts)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchAlerts()
  }, [])

  const acknowledge_alert = async (alert_id) => {
    try {
      const updatedAlert = await apiFetch(`/alerts/${alert_id}/acknowledge`, {
        method: 'POST'
      })

      // Update alert state locally with the latest backend values
      setAlerts((prevAlerts) =>
        prevAlerts.map((alert) =>
          alert.alert_id === alert_id
            ? { ...alert, ...updatedAlert }
            : alert
        )
      )
    } catch (error) {
      console.error('Error acknowledging alert:', error)
    }
  }

  const unacknowledge_alert = async (alert_id) => {
    try {
      const updatedAlert = await apiFetch(`/alerts/${alert_id}/unacknowledge`, {
        method: 'POST'
      })

      // Update alert state locally
      setAlerts((prevAlerts) =>
        prevAlerts.map((alert) =>
          alert.alert_id === alert_id
            ? { ...alert, ...updatedAlert }
            : alert
        )
      )
    } catch (error) {
      console.error('Error unacknowledging alert:', error)
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

  const dateObj = new Date(dateString)

  return dateObj.toLocaleString('en-US', {

    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit'
  })
}

  return (
    <div className="alerts-container">
      <div className="alerts-header">
        <h1>Alerts</h1>
        <button 
          className="btn-back"
          onClick={() => navigate('/dashboard')}
        >
          Back to Dashboard
        </button>
      </div>

      {loading && <div className="loading">Loading alerts...</div>}

      {!loading && alerts.length === 0 && (
        <div className="no-alerts">
          <p>No alerts to display</p>
        </div>
      )}

      <div className="alerts-list">
        {alerts.map((alert) => (
          <div 
            key={alert.alert_id} 
            className={`alert-card ${getSeverityClass(alert.alert_severity)} ${alert.acknowledged ? 'acknowledged' : ''}`}
          >
            <div className="alert-header-row">
              <div className="alert-title-section">
                <h3 className="alert-type">{alert.alert_type}</h3>
                <div className="alert-badges">
                  <span className={`badge ${getMethodBadge(alert.alert_method)}`}>
                    {alert.alert_method.toUpperCase()}
                  </span>
                  <span className={`badge severity-badge ${getSeverityClass(alert.alert_severity)}`}>
                    {alert.alert_severity.toUpperCase()}
                  </span>
                  {alert.acknowledged && (
                    <span className="badge acknowledged-badge">ACKNOWLEDGED</span>
                  )}
                </div>
              </div>
              <div className="alert-time">
                {formatDate(alert.created_at)}
              </div>
            </div>

            <p className="alert-description">{alert.alert_description}</p>

            {(alert.acknowledged && alert.acknowledged_at) ? (
              <div className="alert-footer">
                <small className="acknowledged-time">
                  Acknowledged at {formatDate(alert.acknowledged_at)}
                </small>
                <button 
                  className="btn-unacknowledge"
                  onClick={() => {unacknowledge_alert(alert.alert_id)}}
                >
                  Unacknowledge
                </button>
              </div>
            ) : (
              <div className="alert-footer">
                <button 
                  className="btn-acknowledge"
                  onClick={() => {acknowledge_alert(alert.alert_id)}}
                >
                  Acknowledge
                </button>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}

export default Alerts


/*
Alert data from database
{
	alert_id: int
	alert_type: string
	alert_severity: string
	alert_description: string
	alert_method: “threshold” | “ml”
	acknowledged: bool
	created_at: datetime
	acknowledged_at: datetime
	
}
*/