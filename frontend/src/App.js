import React, { useState } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";  // ✅ Added for routing
import Quotation from "./pages/Quotation";
import Login from "./pages/Login";
import Page from "./pages/Page"; // ✅ Import your print layout page

function App() {
  const [token, setToken] = useState(null);

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
