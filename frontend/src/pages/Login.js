import React, { useState } from "react";
import "./Login.css";
import Header from "../components/Header";

const Login = ({ onLogin }) => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      setError("");
      if(!username){
        setError("Username is required");
        return;
      }
      if(!password){
        setError("Password is required");
        return;
      }
      const rawBase = process.env.REACT_APP_BACKEND_URL || "http://localhost:8000";
      const API_BASE_URL = rawBase.replace(/\/+$/, "");
      const res = await fetch(`${API_BASE_URL}/api/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });
      const contentType = res.headers.get("content-type") || "";
      let data = null;
      if (contentType.includes("application/json")) {
        data = await res.json();
      } else {
        const text = await res.text();
        throw new Error(text || "Unexpected non-JSON response from server");
      }
      if (!res.ok) throw new Error(data.message || "Login failed");
      
      // Store token in localStorage
      localStorage.setItem("token", data.token);
      
      // Notify parent component
      onLogin?.(data.token);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <Header />
    <div className="login-container">
      <form onSubmit={handleSubmit} className="login-form">
        <h1 className="login-title">Sign in</h1>
        <p className="login-subtitle">Welcome back! Please sign in to continue</p>
        
        {error ? <div className="error-message">{error}</div> : null}
        
        <div className="form-group">
          <label className="form-label">Username</label>
          <input 
            className="form-input"
            placeholder="Enter username" 
            value={username} 
            onChange={(e) => setUsername(e.target.value)} 
          />
        </div>
        
        <div className="form-group">
          <label className="form-label">Password</label>
          <input 
            className="form-input"
            placeholder="••••••••" 
            type="password" 
            value={password} 
            onChange={(e) => setPassword(e.target.value)} 
          />
        </div>
        
        <button type="submit" disabled={loading} className="submit-button">
          {loading ? "Signing in..." : "Sign In"}
        </button>
      </form>
    </div>
  </div>
  );
};

export default Login;


