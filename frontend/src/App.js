import React, { useState, useEffect } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Quotation from "./pages/Quotation";
import Login from "./pages/Login";
import Page from "./pages/Page";
import "./styles/design-system.css";

function App() {
  const [token, setToken] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  // Check for existing token on app startup
  useEffect(() => {
    const savedToken = localStorage.getItem("token");
    console.log("App startup - checking for token:", savedToken ? "Found" : "Not found");
    
    if (savedToken) {
      // Check if token is expired locally (basic JWT decode)
      if (isTokenExpired(savedToken)) {
        console.log("Token is expired, removing it");
        localStorage.removeItem("token");
        setIsLoading(false);
        return;
      }
      
      // Token exists and is not expired, set it immediately
      console.log("Setting token from localStorage:", savedToken);
      setToken(savedToken);
      setIsLoading(false);
      
      // Don't validate with backend immediately - just trust the local token
      // This ensures user stays logged in even if backend is slow/unavailable
      console.log("User authenticated with valid token - staying logged in");
    } else {
      console.log("No token found, showing login");
      setIsLoading(false);
    }
  }, []);

  // Simple JWT token expiration check
  const isTokenExpired = (token) => {
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      const currentTime = Date.now() / 1000;
      const expirationTime = payload.exp;
      const timeUntilExpiry = expirationTime - currentTime;
      
      console.log("Token expiration check:");
      console.log("- Current time:", new Date(currentTime * 1000).toLocaleString());
      console.log("- Expires at:", new Date(expirationTime * 1000).toLocaleString());
      console.log("- Time until expiry:", Math.round(timeUntilExpiry / 3600), "hours");
      
      const isExpired = payload.exp < currentTime;
      if (isExpired) {
        console.log("❌ Token is EXPIRED");
      } else {
        console.log("✅ Token is VALID");
      }
      
      return isExpired;
    } catch (error) {
      console.log("Error checking token expiration:", error);
      return true; // If we can't parse it, consider it expired
    }
  };

  const validateTokenInBackground = async (tokenToValidate) => {
    try {
      const response = await fetch("http://localhost:8000/api/auth/validate", {
        method: "GET",
        headers: {
          "Authorization": `Bearer ${tokenToValidate}`,
          "Content-Type": "application/json",
        },
      });
      
      if (!response.ok) {
        console.log("Token validation failed, removing token");
        localStorage.removeItem("token");
        setToken(null);
      } else {
        console.log("Token validation successful");
      }
    } catch (error) {
      console.log("Token validation error (non-blocking):", error.message);
      // Don't remove token on network errors, just log
      // This ensures the user stays logged in even if backend is down
    }
  };

  // Debug function to check current state
  const debugAuthState = () => {
    console.log("=== AUTH DEBUG ===");
    console.log("Token state:", token);
    console.log("Loading state:", isLoading);
    const savedToken = localStorage.getItem("token");
    console.log("localStorage token:", savedToken ? "Present" : "Missing");
    
    if (savedToken) {
      try {
        const payload = JSON.parse(atob(savedToken.split('.')[1]));
        const currentTime = Date.now() / 1000;
        const timeUntilExpiry = payload.exp - currentTime;
        console.log("Token expires in:", Math.round(timeUntilExpiry / 3600), "hours");
        console.log("Token is valid:", timeUntilExpiry > 0);
      } catch (e) {
        console.log("Error parsing token:", e.message);
      }
    }
    console.log("==================");
  };

  // Function to manually refresh token (for testing)
  const refreshToken = () => {
    const savedToken = localStorage.getItem("token");
    if (savedToken) {
      setToken(savedToken);
      console.log("Token refreshed manually");
    } else {
      console.log("No token to refresh");
    }
  };

  // Add debug functions to window for easy testing
  useEffect(() => {
    window.debugAuth = debugAuthState;
    window.refreshToken = refreshToken;
  }, [token, isLoading]);

  // Show loading screen while checking authentication
  if (isLoading) {
    return (
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        height: '100vh',
        backgroundColor: '#f8fafc',
        fontFamily: 'Inter, sans-serif'
      }}>
        <div style={{
          textAlign: 'center',
          padding: '2rem',
          backgroundColor: 'white',
          borderRadius: '12px',
          boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
          border: '1px solid #e2e8f0'
        }}>
          <div style={{
            width: '40px',
            height: '40px',
            border: '4px solid #e2e8f0',
            borderTop: '4px solid #1e40af',
            borderRadius: '50%',
            animation: 'spin 1s linear infinite',
            margin: '0 auto 1rem'
          }}></div>
          <p style={{ color: '#6b7280', margin: 0 }}>Loading...</p>
        </div>
        <style>{`
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
        `}</style>
      </div>
    );
  }

  return (
    <Router>
      <Routes>
        {/* ✅ Login Route */}
        <Route
          path="/"
          element={
            !token ? (
              <Login onLogin={(t) => setToken(t)} />
            ) : (
              <Quotation
                onLogout={() => {
                  localStorage.removeItem("token");
                  setToken(null);
                }}
              />
            )
          }
        />

        {/* ✅ Print Page Route */}
        <Route path="/page" element={<Page />} />
      </Routes>
    </Router>
  );
}

export default App;
