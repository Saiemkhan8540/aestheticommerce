import React from 'react';
import './SettingsSection.css';

function SettingsSection({ title, children }) {
  return (
    <div className="settings-section">
      <h2>{title}</h2>
      <div className="settings-content">
        {children}
      </div>
    </div>
  );
}

export default SettingsSection;