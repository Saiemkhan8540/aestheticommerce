import React from 'react';
import './SettingsPage.css';
import SettingsSection from './SettingsSection';

function SettingsPage() {
  return (
    <div className="settings-page">
      <h1>Settings</h1>

      <SettingsSection title="Profile">
        <label>Name:</label>
        <input type="text" placeholder="Your name" />

        <label>Email:</label>
        <input type="email" placeholder="you@example.com" />

        <label>Password:</label>
        <input type="password" placeholder="********" />
      </SettingsSection>

      <SettingsSection title="Store">
        <label>Store Name:</label>
        <input type="text" placeholder="My Store" />

        <label>Currency:</label>
        <select>
          <option value="INR">INR</option>
          <option value="USD">USD</option>
          <option value="EUR">EUR</option>
        </select>
      </SettingsSection>

      <SettingsSection title="Preferences">
        <label>
          <input type="checkbox" /> Email Notifications
        </label>

        <label>
          <input type="checkbox" /> Dark Mode
        </label>
      </SettingsSection>

      <div className="settings-actions">
        <button className="save-btn">Save Changes</button>
        <button className="cancel-btn">Cancel</button>
      </div>
    </div>
  );
}

export default SettingsPage;