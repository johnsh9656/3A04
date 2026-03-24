import { useState, useEffect } from "react";
import { apiFetch } from "../api/client";

export default function DashboardPage() {
  const [health, setHealth] = useState(null);

  useEffect(() => {
        apiFetch("/health").then(setHealth).catch(console.error);
        
  }, []);

  return (
    <>
        <h1>Dashboard</h1>
        <p>System health: {health?.status || "Checking..."}</p>
    </>
  )
}