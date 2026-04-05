import { useState } from "react";
import "./LoginPage.css";

const ACCOUNTS = [
  { username: "operator", password: "operator123", role: "City Operator" },
  { username: "admin", password: "admin123", role: "System Admin" },
];

export default function LoginPage() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loggedInAs, setLoggedInAs] = useState(null);

  const handleLogin = () => {
    const match = ACCOUNTS.find(
      (acc) => acc.username === username && acc.password === password
    );

    if (match) {
      setError("");
      setLoggedInAs(match.role);
    } else {
      setError("Invalid username or password. Please try again.");
    }
  };

  return (
    <div className="login-page">
      {/* Background */}
      <div className="login-bg-image" />
      <div className="login-bg-overlay" />

      {/* Page title */}
      <h1 className="login-page-title">Smart City Environmental Monitoring System</h1>

      {/* Login card */}
      <div className="login-center-wrapper">
        <div className="login-card">
          <h2 className="login-card-title">Login to System</h2>
          <p className="login-card-subtitle">
            Enter your username and password to enter SCEMAS
          </p>

          {loggedInAs ? (
            <div className="login-success">
              <span className="login-success-icon">✓</span>
              <p className="login-success-title">Login Successful</p>
              <p className="login-success-role">Welcome, <strong>{loggedInAs}</strong></p>
            </div>
          ) : (
            <div>
              {/* Username */}
              <div className="login-field-group">
                <label className="login-label" htmlFor="username">
                  Username
                </label>
                <input
                  id="username"
                  type="text"
                  autoComplete="username"
                  value={username}
                  onChange={(e) => { setUsername(e.target.value); setError(""); }}
                  className={`login-input ${error ? "login-input-error" : ""}`}
                />
              </div>

              {/* Password */}
              <div className="login-field-group">
                <label className="login-label" htmlFor="password">
                  Password
                </label>
                <input
                  id="password"
                  type="password"
                  autoComplete="current-password"
                  value={password}
                  onChange={(e) => { setPassword(e.target.value); setError(""); }}
                  className={`login-input ${error ? "login-input-error" : ""}`}
                />
              </div>

              {/* Error message */}
              {error && <p className="login-error">{error}</p>}

              {/* Login button */}
              <button className="login-button" onClick={handleLogin}>
                Login
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}