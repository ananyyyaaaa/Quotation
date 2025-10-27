import React from "react";
import "./Settings.css";

const Settings = () => {
  return (
    <div className="settings-page">
      {/* Header */}
      <div className="settings-header">
        <div className="header-content">
          <div className="header-left">
            <h1>⚙️ Settings</h1>
            <p>Configure your application preferences</p>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="settings-content">
        <div className="settings-card">
          <div className="card-header">
            <h2>Application Settings</h2>
            <p>Manage your application configuration</p>
          </div>
          <div className="card-content">
            <div className="coming-soon">
              <div className="coming-soon-icon">🚧</div>
              <h3>Coming Soon</h3>
              <p>Settings form will be added in the next update</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Settings;
