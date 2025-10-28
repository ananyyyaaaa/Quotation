import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import PopupContainer from "../components/PopupContainer";
import { usePopupManager } from "../hooks/usePopupManager";
import "./Dashboard.css";

const Dashboard = ({ onLogout }) => {
  const [quotations, setQuotations] = useState([]);
  const [loading, setLoading] = useState(true);
  const { popups, showError, hidePopup } = usePopupManager();
  const navigate = useNavigate();

  useEffect(() => {
    fetchQuotations();
  }, []);

  const fetchQuotations = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        showError("Authentication required. Please login again.");
        setTimeout(() => {
          navigate("/");
        }, 2000);
        return;
      }
      const API_BASE_URL=process.env.REACT_APP_BACKEND_URL;
      const response = await fetch(`${API_BASE_URL}/api/quotations`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || "Failed to fetch quotations");
      }

      setQuotations(data.quotations || []);
    } catch (error) {
      console.error("Error fetching quotations:", error);
      showError("Error loading quotations: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleView = (quotationId) => {
    navigate(`/quotation/${quotationId}?mode=view`);
  };

  const handleEdit = (quotationId) => {
    navigate(`/quotation/${quotationId}?mode=edit`);
  };

  const handleNewQuotation = () => {
    navigate("/quotation/new");
  };

  const getStatusColor = (status) => {
    const statusColors = {
      Draft: "#fbbf24",
      Prepared: "#60a5fa",
      Verified: "#34d399",
      Accepted: "#10b981",
      Rejected: "#f87171",
    };
    return statusColors[status] || "#9ca3af";
  };

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  return (
    <div className="dashboard-page">
      <PopupContainer popups={popups} onClose={hidePopup} />

      {/* Header */}
      <div className="dashboard-header">
        <div className="header-content">
          <div className="header-left">
            <h1>📊 Dashboard</h1>
            <p>Manage your quotations</p>
          </div>
          <div className="header-right">
            <button className="action-btn primary" onClick={handleNewQuotation}>
              ➕ New Quotation
            </button>
            <button className="action-btn secondary" onClick={onLogout}>
              🔓 Logout
            </button>
          </div>
        </div>
      </div>

      {/* Table Container */}
      <div className="dashboard-content">
        {loading ? (
          <div className="loading-container">
            <div className="spinner"></div>
            <p>Loading quotations...</p>
          </div>
        ) : quotations.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">📋</div>
            <h2>No quotations yet</h2>
            <p>Create your first quotation to get started</p>
            <button className="action-btn primary" onClick={handleNewQuotation}>
              ➕ New Quotation
            </button>
          </div>
        ) : (
          <div className="table-container">
            <table className="dashboard-table">
              <thead>
                <tr>
                  <th>Quotation Number</th>
                  <th>Date</th>
                  <th>Customer</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {quotations.map((quotation) => (
                  <tr key={quotation._id}>
                    <td className="quotation-number">
                      #{quotation.quotationNumber || "N/A"}
                    </td>
                    <td>{formatDate(quotation.date)}</td>
                    <td>
                      {quotation.customer?.name || "No customer"}
                    </td>
                    <td>
                      <span
                        className="status-badge"
                        style={{
                          backgroundColor: getStatusColor(quotation.status),
                        }}
                      >
                        {quotation.status || "Draft"}
                      </span>
                    </td>
                    <td className="actions-cell">
                      <button
                        className="action-btn-small view-btn"
                        onClick={() => handleView(quotation._id)}
                      >
                        👁️ View
                      </button>
                      <button
                        className="action-btn-small edit-btn"
                        onClick={() => handleEdit(quotation._id)}
                      >
                        ✏️ Edit
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;

