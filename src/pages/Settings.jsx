import React, { useState } from "react";
import ProfileSection from "../components/ProfileSection";
import "./Settings.css";

function Settings() {
  const [activeTab, setActiveTab] = useState("profile");

  const [notificationsEnabled, setNotificationsEnabled] = useState(
    JSON.parse(localStorage.getItem("notifications") || "true")
  );

  return (
    <div className="settings-page">

      {/* 🔝 Tabs */}
      <div className="settings-tabs">
  <div className="tabs-container">
    <button
      onClick={() => setActiveTab("profile")}
      className={activeTab === "profile" ? "active" : ""}
    >
      Profile
    </button>

    <button
      onClick={() => setActiveTab("notifications")}
      className={activeTab === "notifications" ? "active" : ""}
    >
      Notifications
    </button>

    <button
      onClick={() => setActiveTab("preferences")}
      className={activeTab === "preferences" ? "active" : ""}
    >
      Preferences
    </button>

    <button
      onClick={() => setActiveTab("privacy")}
      className={activeTab === "privacy" ? "active" : ""}
    >
      Privacy
    </button>
  </div>
</div>

      {/* 🔽 Content */}

      {activeTab === "profile" && <ProfileSection />}

      {activeTab === "notifications" && (
        <div className="settings-card">
          <h3>Notifications</h3>

          <label>
            <input
              type="checkbox"
              checked={notificationsEnabled}
              onChange={(e) => {
  const value = e.target.checked;
  setNotificationsEnabled(value);
  localStorage.setItem("notifications", JSON.stringify(value));
}}
            />
            Enable Notifications
          </label>
        </div>
      )}

      {activeTab === "preferences" && (
        <div className="settings-card">
          <h3>Preferences</h3>

          <label>
            <input type="checkbox" />
            Dark Mode
          </label>
        </div>
      )}

      {activeTab === "privacy" && (
        <div className="settings-card">
          <h3>Privacy</h3>

          <button className="danger">
            Delete Account
          </button>
        </div>
      )}

    </div>
  );
}

export default Settings;