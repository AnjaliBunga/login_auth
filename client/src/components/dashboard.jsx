import React from "react";
import { Link } from "react-router-dom";
import "../App.css";

export default function Dashboard() {
  return (
    <div className="dashboard-container">
      <header className="dashboard-header">
        <div>
          <h2 className="dashboard-title">Hello user,</h2>
          <p className="dashboard-subtitle">How are you doing today?</p>
        </div>

        <Link to="/signin" className="logout-btn">Logout</Link>
      </header>

      <hr className="divider" />
    </div>
  );
}
