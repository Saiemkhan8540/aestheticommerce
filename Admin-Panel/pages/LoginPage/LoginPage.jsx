import React, { useState } from 'react';
import axios from 'axios';
import './LoginPage.css';
import logo from '../../src/Images/Asset9.png';

const API = import.meta.env.VITE_API_URL;

const LoginPage = ({ setIsAdmin }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post(`${API}/api/admin/login`, {
        email,
        password,
      });
      localStorage.setItem('adminToken', response.data.token);
      setIsAdmin(true);
    } catch (err) {
      setError('Invalid email or password');
    }
  };

  return (
    <div className="login-page">
      <div className="login-box">
        <img src={logo} alt="Infinart Logo" style={{ width: '100px', marginBottom: '5px' }} />
        <h2>Admin Panel Login</h2>
        <p>Please enter your credentials to continue.</p>
        <form onSubmit={handleLogin}>
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          {error && <p className="login-message error">{error}</p>}
          <button type="submit" className="login-btn">Login</button>
        </form>
      </div>
    </div>
  );
};

export default LoginPage;