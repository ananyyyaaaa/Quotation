import React, { useState, useEffect } from "react";
import PopupContainer from "../components/PopupContainer";
import { usePopupManager } from "../hooks/usePopupManager";
import "./Customers.css";

const Customers = () => {
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const { popups, showError, hidePopup } = usePopupManager();

  useEffect(() => {
    fetchCustomers();
  }, []);

  const fetchCustomers = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        showError("Authentication required. Please login again.");
        return;
      }
      const API_BASE_URL=process.env.REACT_APP_BACKEND_URL;
      const response = await fetch(`${API_BASE_URL}/api/customers`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || "Failed to fetch customers");
      }

      setCustomers(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Error fetching customers:", error);
      showError("Error loading customers: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  const filteredCustomers = customers.filter(customer =>
    customer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    customer.mobileNumber.includes(searchTerm) ||
    (customer.gstNumber && customer.gstNumber.toLowerCase().includes(searchTerm.toLowerCase()))
  );

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
    <div className="customers-page">
      <PopupContainer popups={popups} onClose={hidePopup} />

      {/* Header */}
      <div className="customers-header">
        <div className="header-content">
          <div className="header-left">
            <h1>👥 Customers</h1>
            <p>Manage your customer database</p>
          </div>
          <div className="header-right">
            <div className="search-container">
              <input
                type="text"
                placeholder="Search customers..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="search-input"
              />
              <span className="search-icon">🔍</span>
            </div>
          </div>
        </div>
      </div>

      {/* Table Container */}
      <div className="customers-content">
        {loading ? (
          <div className="loading-container">
            <div className="spinner"></div>
            <p>Loading customers...</p>
          </div>
        ) : filteredCustomers.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">👥</div>
            <h2>{searchTerm ? "No customers found" : "No customers yet"}</h2>
            <p>{searchTerm ? "Try adjusting your search terms" : "Customers will appear here once added"}</p>
          </div>
        ) : (
          <div className="table-container">
            <table className="customers-table">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Mobile Number</th>
                  <th>GST Number</th>
                  <th>Address</th>
                  <th>Building</th>
                  <th>Floor</th>
                  <th>Landmark</th>
                  <th>Created</th>
                </tr>
              </thead>
              <tbody>
                {filteredCustomers.map((customer) => (
                  <tr key={customer._id}>
                    <td className="customer-name">
                      <strong>{customer.name}</strong>
                    </td>
                    <td className="mobile-number">
                      <a href={`tel:${customer.mobileNumber}`}>
                        {customer.mobileNumber}
                      </a>
                    </td>
                    <td>{customer.gstNumber || "N/A"}</td>
                    <td>{customer.address || "N/A"}</td>
                    <td>{customer.building || "N/A"}</td>
                    <td>{customer.floor || "N/A"}</td>
                    <td>{customer.nearestLandmark || "N/A"}</td>
                    <td>{formatDate(customer.createdAt)}</td>
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

export default Customers;
