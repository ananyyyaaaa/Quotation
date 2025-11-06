import React, { useState } from "react";

const AddEntityModal = ({ type, onClose, onSuccess, existingData = [], showError, showSuccess, showWarning }) => {
  const [formData, setFormData] = useState({
    name: "",
    mobileNumber: "",
  });

  const handleSave = async () => {
    const { name, mobileNumber } = formData;

    if (!name.trim()) {
      showError(`${type} name is required`);
      return;
    }

    if (mobileNumber && mobileNumber.trim() !== "" && !/^\d{10}$/.test(mobileNumber.trim())) {
      showError("Mobile number must be 10 digits if provided");
      return;
    }

    // Duplicate mobile validation
    if (mobileNumber && mobileNumber.trim() !== "") {
      const duplicate = existingData.find(
        d => d.mobileNumber && d.mobileNumber === mobileNumber.trim()
      );
      if (duplicate) {
        showWarning(`${type} with this mobile number already exists`);
        return;
      }
    } else {
      const duplicate = existingData.find(
        d => !d.mobileNumber && d.name.trim().toLowerCase() === name.trim().toLowerCase()
      );
      if (duplicate) {
        showWarning(`${type} with this name already exists (no mobile provided)`);
        return;
      }
    }

    try {
      const API_BASE_URL = process.env.REACT_APP_BACKEND_URL;
      const res = await fetch(`${API_BASE_URL}/api/${type}s`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${localStorage.getItem("token")}` },
        body: JSON.stringify({
          name: name.trim(),
          mobileNumber: mobileNumber.trim() || null,
        }),
      });
      const data = await res.json();

      if (!res.ok) {
        showError(data.message || `Failed to add ${type}`);
        return;
      }

      showSuccess(`${type.charAt(0).toUpperCase() + type.slice(1)} added successfully!`);
      onSuccess(data);
      onClose();
    } catch (err) {
      console.error(err);
      showError(`Error adding ${type}`);
    }
  };

  return (
    <div className="modal-overlay">
      <div className="modal">
        <h4>Add New {type.charAt(0).toUpperCase() + type.slice(1)}</h4>
        <div className="form-group">
          <label>Name</label>
          <input
            value={formData.name}
            onChange={e => setFormData({ ...formData, name: e.target.value })}
            placeholder={`Enter ${type} name`}
          />
        </div>
        <div className="form-group">
          <label>Mobile Number</label>
          <input
            value={formData.mobileNumber}
            onChange={e =>
              setFormData({
                ...formData,
                mobileNumber: e.target.value.replace(/\D/g, "").slice(0, 10),
              })
            }
            placeholder="10 digit mobile (optional)"
          />
        </div>
        <div className="modal-actions">
          <button onClick={handleSave}>Save</button>
          <button onClick={onClose}>Cancel</button>
        </div>
      </div>
    </div>
  );
};

export default AddEntityModal;
