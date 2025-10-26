import React, { useState } from "react";

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
      const res = await fetch(`http://localhost:8000/api/auth/${endpoint}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Login failed");
      localStorage.setItem("token", data.token);
      onLogin?.(data.token);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "center", minHeight: "100vh", background: "#f5f7fb", padding: 16 }}>
      <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 10, width: 340, padding: 28, borderRadius: 14, background: "#ffffff", boxShadow: "0 12px 32px rgba(16,24,40,0.08)", border: "1px solid #eef2f7" }}>
        <div style={{ fontSize: 20, fontWeight: 600, marginBottom: 6 }}>{mode === "signup" ? "Sign up" : "Sign in"}</div>
        {error ? <div style={{ background: "#FEF3F2", color: "#B42318", border: "1px solid #FEE4E2", padding: "8px 10px", borderRadius: 8, fontSize: 13 }}>{error}</div> : null}
        <label style={{ fontSize: 13, color: "#344054" }}>{mode === "signup" ? "Gmail address" : "Email or username"}</label>
        <input placeholder={mode === "signup" ? "you@gmail.com" : "you@gmail.com"} value={username} onChange={(e) => setUsername(e.target.value)} style={{
          padding: 10,
          borderRadius: 8,
          border: "1px solid #d0d5dd",
          outline: "none"
        }} />
        <label style={{ fontSize: 13, color: "#344054" }}>Password</label>
        <input placeholder="••••••••" type="password" value={password} onChange={(e) => setPassword(e.target.value)} style={{
          padding: 10,
          borderRadius: 8,
          border: "1px solid #d0d5dd",
          outline: "none"
        }} />
        <button type="submit" disabled={loading} style={{
          padding: 10,
          borderRadius: 8,
          border: "none",
          background: "#1594e3",
          color: "white",
          cursor: "pointer",
          marginTop: 4
        }}>
          {loading ? (mode === "signup" ? "Creating..." : "Signing in...") : (mode === "signup" ? "Sign Up" : "Sign In")}
        </button>
        <button type="button" onClick={() => setMode(mode === "signup" ? "signin" : "signup")} style={{
          padding: 10,
          borderRadius: 8,
          border: "1px solid #d0d5dd",
          background: "white",
          color: "#344054",
          cursor: "pointer"
        }}>
          {mode === "signup" ? "Have an account? Sign in" : "New here? Create account"}
        </button>
      </form>
    </div>
  );
};

export default Login;


