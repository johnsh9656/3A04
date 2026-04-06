import { useState, useEffect } from "react"
import { useNavigate } from 'react-router-dom'
import '../styles/DashboardPage.css'
import { apiFetch } from "../api/client"

import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const SCEMAS_USER_KEY = "scemasUser"

function readSessionUser() {
  try {
    const raw = sessionStorage.getItem(SCEMAS_USER_KEY)
    if (!raw) return null
    const parsed = JSON.parse(raw)
    return parsed && typeof parsed.username === "string" ? parsed : null
  } catch {
    return null
  }
}

export default function DashboardPage() {

  const [alerts, setAlerts] = useState([])
  const [loading, setLoading] = useState(false)
  const [audits, setAudits] = useState([])
  const [devices, setDevices] = useState([])
  const [telemetry, setTelemetry] = useState([])
  const navigate = useNavigate()
  const [user] = useState(() => readSessionUser())
  const isAdmin = user?.username === "admin"

  // Mock states for the graph filters
  const [location, setLocation] = useState('All Sectors')
  const [timeRange, setTimeRange] = useState('Last Hour')
  const [dataType, setDataType] = useState('Temperature')

  // Dummy data for the alerts section
  const recentAlerts = [
    { id: 1, time: "14:32", type: "Temp High", loc: "Block 38", desc: "Exceeds 85°C", level: "Critical" },
    { id: 2, time: "12:15", type: "Anomaly", loc: "Sector 4", desc: "Unusual power pattern", level: "High" },
    { id: 3, time: "10:45", type: "Humidity Low", loc: "Block 12", desc: "Dropped below 30%", level: "Medium" },
    { id: 4, time: "09:20", type: "Offline", loc: "Sensor 5", desc: "No data for 30m", level: "High" } 
  ]

  // Dummy data for audit logs
  const dummyAuditLogs = [
    {
      "audit_id": 1,
      "user": "system",
      "action": "Performed scheduled backup of database.",
      "created_at": "2026-03-28T12:00:00"
    },
    {
      "audit_id": 2,
      "user": "system",
      "action": "Restarted application server after update.",
      "created_at": "2026-03-28T15:05:09"
    },
    {
      "audit_id": 3,
      "user": "operator",
      "action": "Ackowledeged Alert 3.",
      "created_at": "2026-03-28T10:42:11"
    },
    {
      "audit_id": 4,
      "user": "system",
      "action": "Detected and blocked unauthorized login attempt.",
      "created_at": "2026-03-28T16:02:37"
    },
    {
      "audit_id": 5,
      "user": "system",
      "action": "System health check completed successfully.",
      "created_at": "2026-03-28T17:30:00"
    },
    {
      "audit_id": 6,
      "user": "admin",
      "action": "Updated Humidity threshold.",
      "created_at": "2026-03-28T18:12:44"
    }
  ]

  const fetchDevices = async () => {
    try {
      const data = await apiFetch('/devices')
      setDevices(data)
    } catch (error) {
      console.error('Error fetching devices:', error)
      setDevices([
      { device_id: 1, location: "Downtown Hamilton" },
      { device_id: 2, location: "McMaster Campus" }
      ])
  }
  }

  const getFilteredData = () => {
    let targetDeviceId = null
    if (location !== 'All Sectors') {
      const selectedDevice = devices.find(d => d.location === location)
      targetDeviceId = selectedDevice ? selectedDevice.device_id : null
    }

    const getRangeMs = () => {
      if (timeRange === 'Last 5 Minutes') return 5 * 60 * 1000
      if (timeRange === 'Last Hour') return 60 * 60 * 1000
      if (timeRange === 'Last 6 Hours') return 6 * 60 * 60 * 1000
      if (timeRange === 'Last 12 Hours') return 12 * 60 * 60 * 1000
      if (timeRange === 'Last Day') return 24 * 60 * 60 * 1000
      if (timeRange === 'Last Week') return 7 * 24 * 60 * 60 * 1000
      if (timeRange === 'Last Month') return 30 * 24 * 60 * 60 * 1000
      return null
    }

    const rangeMs = getRangeMs()
    const cutoffTimestamp = rangeMs ? Date.now() - rangeMs : null

    return telemetry
      .filter(item => {
        if (targetDeviceId !== null && item.device_id !== targetDeviceId) {
          return false
        }

        if (cutoffTimestamp !== null) {
          return new Date(item.created_at).getTime() >= cutoffTimestamp
        }

        return true
      })
      .sort((a, b) => new Date(a.created_at) - new Date(b.created_at))
      .map(item => {
        const dateObj = new Date(item.created_at)
        const formattedTimestamp = dateObj.toLocaleString([], {
          month: 'short',
          day: 'numeric',
          hour: '2-digit',
          minute: '2-digit'
        })
        return {
          pointLabel: `${formattedTimestamp} · Device ${item.device_id} · #${item.telemetry_id}`,
          fullTimestamp: formattedTimestamp,
          deviceId: item.device_id,
          telemetryId: item.telemetry_id,
          value: item[dataType.toLowerCase().replace(' ', '_')]
        }
      })
  }

  const chartData = getFilteredData()

  
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

  const fetchTelemetry = async () => {
    try {
      console.log('[Dashboard] Fetching telemetry from /telemetry')
      const telemetryData = await apiFetch('/telemetry')
      console.log('[Dashboard] /telemetry response:', telemetryData)
      setTelemetry(Array.isArray(telemetryData) ? telemetryData : [])
    } catch (error) {
      console.error('Error fetching telemetry data:', error)
      setTelemetry([])
    }
  }

  useEffect(() => {
    if (!user) {
      navigate("/", { replace: true })
      return
    }
    fetchAlerts()
    fetchDevices()
    fetchTelemetry()
    if (isAdmin) {
      fetchAudits()
    } else {
      setAudits([])
    }
  }, [user, isAdmin, navigate])

  const fetchAudits = async () => {
    try {
      const audit_data = await apiFetch('/audits')
      setAudits(audit_data)
    } catch (error) {
      console.error('Error fetching system audits:', error)
      setAudits(dummyAuditLogs)
    } 
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

  if (!user) {
    return null
  }

  return (
    <div className="dashboard-page">

      {/* Background */}
      <div className="login-bg-image" />
      <div className="login-bg-overlay" />

      <div className="title">
        <h2>SCEMAS Dashboard</h2>
      </div>

      {/* TOP SECTION: Data Views */}
      <div className="data-section">
        <div className="data-visualization">
          <div className="graph-section">
             {/* Mockup of a Graph View */}
            <div className="graph-container">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#ccc" />
                  <XAxis 
                    dataKey="pointLabel" 
                    tick={{ fontSize: 10 }}
                    tickFormatter={(value) => value.split(' · ')[0]}
                    interval="preserveStartEnd"
                    minTickGap={24}
                    allowDuplicatedCategory={false}
                  />
                  <YAxis label={{ value: dataType, angle: -90, position: 'insideLeft' }} />
                  <Tooltip
                    formatter={(value) => [value, dataType]}
                    labelFormatter={(label, payload) => payload?.[0]?.payload
                      ? `${payload[0].payload.fullTimestamp} - Device ${payload[0].payload.deviceId}`
                      : label
                    }
                  />
                  <Line 
                    type="monotone" 
                    dataKey="value" 
                    stroke="#2e7d32" 
                    strokeWidth={3} 
                    dot={{ r: 5 }} 
                    activeDot={{ r: 9, strokeWidth: 2 }} 
                    isAnimationActive={false}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>  
          <div className="filter-options">
            <select value={location} onChange={(e) => setLocation(e.target.value)}>
              <option value="All Sectors">All Sectors</option>
              {devices.map(device => (
                <option key={device.device_id} value={device.location}>
                  {device.location}
                </option>
              ))}
            </select>
            <select value={dataType} onChange={(e) => setDataType(e.target.value)}>
              <option>Temperature</option>
              <option>Humidity</option>
              <option>Air Quality</option>
              <option>Noise Level</option>
            </select>
            <select value={timeRange} onChange={(e) => setTimeRange(e.target.value)}>
              <option>Last 5 Minutes</option>
              <option>Last Hour</option>
              <option>Last 6 Hours</option>
              <option>Last 12 Hours</option>
              <option>Last Day</option>
              <option>Last Week</option>
              <option>Last Month</option>
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
            <button
              type="button"
              className="btn-secondary"
              disabled={!isAdmin}
              title={isAdmin ? undefined : "Only system administrators can edit alert thresholds."}
            >
              Edit Alert Thresholds
            </button>
            <button className="btn-secondary">View System Health</button>
          </div>
        </div>

        {isAdmin && (
          <div className="audit-section">
            <div className="audit-title">
               <h2>System Audits</h2>
            </div>
            <div className="log-container">
              {audits.length === 0 && <p>No audit logs available.</p>}
              {dummyAuditLogs.map((log) => (
                <div key={log.audit_id} className="log-entry">
                  {`${formatDate(log.created_at)} (${log.user}) - ${log.action}`}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

