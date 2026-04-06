import { useState } from "react";
import { useNavigate } from "react-router-dom";
import "../styles/LoginPage.css";

const ACCOUNTS = [
  { username: "operator", password: "operator123", role: "City Operator" },
  { username: "admin", password: "admin123", role: "System Admin" },
];

const SCEMAS_USER_KEY = "scemasUser";

export default function LoginPage() {
  const navigate = useNavigate();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleLogin = () => {
    const match = ACCOUNTS.find(
      (acc) => acc.username === username && acc.password === password
    );

    if (match) {
      setError("");
      sessionStorage.setItem(
        SCEMAS_USER_KEY,
        JSON.stringify({ username: match.username, role: match.role })
      );
      navigate("/dashboard");
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

          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleLogin();
            }}
          >
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
              <button type="submit" className="login-button">
                Login
              </button>
            </form>
        </div>
      </div>
    </div>
  );
}