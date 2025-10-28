import React, { useState } from "react";
import "./Login.css";

const Login = ({ onLogin }) => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [mode, setMode] = useState("signin"); // signin | signup
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      setError("");
      if (mode === "signup") {
        if (!/^[A-Za-z0-9._%+-]+@gmail\.com$/.test(username)) {
          setError("Use a valid Gmail address");
          return;
        }
        if (!/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/.test(password)) {
          setError("Min 8 chars with upper, lower, number");
          return;
        }
      }
      const endpoint = mode === "signup" ? "register" : "login";
      const res = await fetch(`${API_BASE_URL}/api/auth/${endpoint}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });
      const data = await res.json();
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
    <div className="login-container">
      <form onSubmit={handleSubmit} className="login-form">
        <h1 className="login-title">{mode === "signup" ? "Sign up" : "Sign in"}</h1>
        <p className="login-subtitle">
          {mode === "signup" ? "Create your account to get started" : "Welcome back! Please sign in to continue"}
        </p>
        
        {error ? <div className="error-message">{error}</div> : null}
        
        <div className="form-group">
          <label className="form-label">{mode === "signup" ? "Gmail address" : "Email or username"}</label>
          <input 
            className="form-input"
            placeholder={mode === "signup" ? "you@gmail.com" : "you@gmail.com"} 
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
          {loading ? (mode === "signup" ? "Creating..." : "Signing in...") : (mode === "signup" ? "Sign Up" : "Sign In")}
        </button>
        
        <button type="button" onClick={() => setMode(mode === "signup" ? "signin" : "signup")} className="toggle-button">
          {mode === "signup" ? "Have an account? Sign in" : "New here? Create account"}
        </button>
      </form>
    </div>
  );
};

export default Login;


