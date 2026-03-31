import { useState } from "react";
import "./LoginPage.css";

export default function LoginPage() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  const handleLogin = () => {
    // TODO: wire up authentication logic here
    console.log("Login attempted:", { username, password });
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
                onChange={(e) => setUsername(e.target.value)}
                className="login-input"
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
                onChange={(e) => setPassword(e.target.value)}
                className="login-input"
              />
            </div>

            {/* Login button */}
            <button className="login-button" onClick={handleLogin}>
              Login
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}