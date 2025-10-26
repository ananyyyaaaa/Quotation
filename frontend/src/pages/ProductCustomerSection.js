import React, { useState, useEffect, forwardRef, useImperativeHandle } from "react";
import PopupContainer from "../components/PopupContainer";
import { usePopupManager } from "../hooks/usePopupManager";
import "./ProductCustomerSection.css";

const ProductCustomerSection = forwardRef((props, ref) => {
  const { popups, showSuccess, showError, showWarning, hidePopup } = usePopupManager();
  
  const [products] = useState([
    "ADDITIONAL - GST 18%",
    "SERVICE - GST 18%",
    "PANELLING - GST 18%",
    "VANITY - GST 18%",
    "DOOR - GST 18%",
    "KITCHEN - GST 18%",
    "FURNITURE - GST 18%",
    "WARDROBE - GST 18%",
  ]);

  const [quotationType, setQuotationType] = useState("");
  const [reference, setReference] = useState("");
  const [designer, setDesigner] = useState("");
  const [manager, setManager] = useState("");

  const [customers, setCustomers] = useState([]);
  const [customerMobile, setCustomerMobile] = useState(""); // mobileNumber as ID

  const [designers, setDesigners] = useState([]);
  const [managers, setManagers] = useState([]);

  const [gst, setGst] = useState("");
  const [mobile, setMobile] = useState("");
  const [building, setBuilding] = useState("");
  const [floor, setFloor] = useState("");
  const [landmark, setLandmark] = useState("");
  const [address, setAddress] = useState("");
  const [remarks, setRemarks] = useState("");
  const [selectedProduct, setSelectedProduct] = useState(products[0]); // default first product

  const [showAddModal, setShowAddModal] = useState(false);
  const [newCustomer, setNewCustomer] = useState({
    name: "",
    gstNumber: "",
    building: "",
    floor: "",
    nearestLandmark: "",
    address: "",
    mobileNumber: "",
  });

  // Fetch designers, managers, customers
  useEffect(() => {
    const authHeader = { Authorization: `Bearer ${localStorage.getItem("token")}` };

    fetch("http://localhost:8000/api/designers", { headers: authHeader })
      .then(res => res.json())
      .then(data => setDesigners(Array.isArray(data) ? data : []))
      .catch(console.error);

    fetch("http://localhost:8000/api/managers", { headers: authHeader })
      .then(res => res.json())
      .then(data => setManagers(Array.isArray(data) ? data : []))
      .catch(console.error);

    fetch("http://localhost:8000/api/customers", { headers: authHeader })
      .then(res => res.json())
      .then(data => setCustomers(Array.isArray(data) ? data : []))
      .catch(err => {
        console.error("Error fetching customers:", err);
        setCustomers([]);
      });
  }, []);

  // Auto-fill when a customer is selected
  useEffect(() => {
    const selected = customers.find(c => c.mobileNumber === customerMobile);
    if (selected) {
      setGst(selected.gstNumber || "");
      setBuilding(selected.building || "");
      setFloor(selected.floor || "");
      setLandmark(selected.nearestLandmark || "");
      setAddress(selected.address || "");
      setMobile(selected.mobileNumber || "");
    } else {
      setGst(""); setBuilding(""); setFloor(""); setLandmark(""); setAddress(""); setMobile("");
    }
  }, [customerMobile, customers]);

  // GST input handler (max 15 alphanumeric)
  const handleGstChange = e => {
    const value = e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, "");
    setGst(value.slice(0, 15));
  };

  // Mobile input handler (max 10 digits)
  const handleMobileChange = e => {
    const value = e.target.value.replace(/\D/g, "");
    setMobile(value.slice(0, 10));
  };

  // Add new customer
  const handleAddCustomer = async () => {
    const { name, gstNumber, building, floor, nearestLandmark, address, mobileNumber } = newCustomer;

    if (!name.trim()) { showError("Customer name is required"); return; }
    if (!/^\d{10}$/.test(mobileNumber)) { showError("Mobile number must be 10 digits"); return; }
    if (gstNumber && !/^[A-Z0-9]{15}$/.test(gstNumber)) { showError("GST number must be 15 alphanumeric"); return; }

    const duplicate = customers.find(c => c.mobileNumber === mobileNumber);
    if (duplicate) {
      return showWarning("Customer with this mobile number already exists");
    }

    try {
      const res = await fetch("http://localhost:8000/api/customers", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${localStorage.getItem("token")}` },
        body: JSON.stringify(newCustomer),
      });
      const data = await res.json();

      if (!res.ok) {
        showError(data.message || "Failed to add customer");
        return;
      }

      setCustomers(prev => [...prev, data]);
      setCustomerMobile(data.mobileNumber); // auto-select newly added
      setGst(data.gstNumber || "");
      setBuilding(data.building || "");
      setFloor(data.floor || "");
      setLandmark(data.nearestLandmark || "");
      setAddress(data.address || "");
      setMobile(data.mobileNumber || "");
      setNewCustomer({ name: "", gstNumber: "", building: "", floor: "", nearestLandmark: "", address: "", mobileNumber: "" });
      setShowAddModal(false);
      showSuccess("Customer added successfully!");
    } catch (err) {
      console.error(err);
      showError("Error adding customer");
    }
  };

  // Expose customer data to parent
  useImperativeHandle(ref, () => ({
    getCustomerData: () => {
      const selected = customers.find(c => c.mobileNumber === customerMobile) || {};
      return {
        customer: selected._id || null, // MongoDB _id
        customerName: selected.name || "",
        product: selectedProduct,
        quotationType,
        reference,
        designer,
        manager,
        shippingAddress: {
          gstNumber: gst,
          building,
          floor,
          nearestLandmark: landmark,
          address,
          mobileNumber: mobile,
        },
        billingAddress: {
          gstNumber: gst,
          building,
          floor,
          nearestLandmark: landmark,
          address,
          mobileNumber: mobile,
        },
        remarks,
      };
    },
  }));

  return (
    <div className="kyc-container">
      <PopupContainer popups={popups} onClose={hidePopup} />
      
      {/* Product Details */}
      <div className="product-details">
        <h4>Product Details</h4>
        <div className="form-group">
          <label>Product</label>
          <select value={selectedProduct} onChange={e => setSelectedProduct(e.target.value)}>
            {products.map((p, i) => <option key={i} value={p}>{p}</option>)}
          </select>
        </div>
        <div className="form-group">
          <label>Quotation Type</label>
          <select value={quotationType} onChange={e => setQuotationType(e.target.value)}>
            <option value="Original">Original</option>
            <option value="Revised">Revised</option>
          </select>
        </div>
        <div className="form-group">
          <label>Reference</label>
          <select value={reference} onChange={e => setReference(e.target.value)}>
            <option value="">Select Reference</option>
            <option>Mr. Reference 1</option>
          </select>
        </div>
        <div className="form-group">
          <label>Designer</label>
          <select value={designer} onChange={e => setDesigner(e.target.value)}>
            <option value="">Select Designer</option>
            <option>Mr. Designer 1</option>
            {designers.map(d => <option key={d._id} value={d.name}>{d.name}</option>)}
          </select>
        </div>
        <div className="form-group">
          <label>Manager</label>
          <select value={manager} onChange={e => setManager(e.target.value)}>
            <option value="">Select Manager</option>
            <option>Mr. Manager 1</option>
            {managers.map(m => <option key={m._id} value={m.name}>{m.name}</option>)}
          </select>
        </div>
      </div>

      {/* Customer Details */}
      <div className="customer-details">
        <h4>Customer Details & Shipping</h4>
        <div className="form-group customer-row">
          <label>Select Customer</label>
          <div style={{ display: "flex", gap: "10px" }}>
            <select value={customerMobile} onChange={e => setCustomerMobile(e.target.value)}>
              <option value="">Select Customer</option>
              {customers.map(c => (
                <option key={c.mobileNumber} value={c.mobileNumber}>
                  {c.name} ({c.mobileNumber})
                </option>
              ))}
            </select>
            <button type="button" onClick={() => setShowAddModal(true)}> Add Customer</button>
          </div>
        </div>

        <div className="form-group"><label>GSTIN</label><input value={gst} onChange={handleGstChange} placeholder="15 DIGIT GST NO" /></div>
        <div className="form-group"><label>Building</label><input value={building} onChange={e => setBuilding(e.target.value)} /></div>
        <div className="form-group"><label>Floor</label><input value={floor} onChange={e => setFloor(e.target.value)} /></div>
        <div className="form-group"><label>Nearest Landmark</label><input value={landmark} onChange={e => setLandmark(e.target.value)} /></div>
        <div className="form-group"><label>Address</label><input value={address} onChange={e => setAddress(e.target.value)} /></div>
        <div className="form-group"><label>Mobile Number</label><input value={mobile} onChange={handleMobileChange} placeholder="10 digit number" /></div>
        <div className="form-group"><label>Remarks</label><input value={remarks} onChange={e => setRemarks(e.target.value)} /></div>
      </div>

      {/* Add Customer Modal */}
      {showAddModal && (
        <div className="modal-overlay">
          <div className="modal">
            <h4>Add New Customer</h4>
            {[
              { label: "Name", key: "name" },
              { label: "GST Number", key: "gstNumber" },
              { label: "Building", key: "building" },
              { label: "Floor", key: "floor" },
              { label: "Nearest Landmark", key: "nearestLandmark" },
              { label: "Address", key: "address" },
              { label: "Mobile Number", key: "mobileNumber" },
            ].map(({ label, key }) => (
              <div key={key} className="form-group">
                <label>{label}</label>
                <input
                  value={newCustomer[key]}
                  onChange={e => {
                    let val = e.target.value;
                    if (key === "mobileNumber") val = val.replace(/\D/g, "").slice(0, 10);
                    if (key === "gstNumber") val = val.toUpperCase().replace(/[^A-Z0-9]/g, "").slice(0, 15);
                    setNewCustomer({ ...newCustomer, [key]: val });
                  }}
                  placeholder={`Enter ${label}`}
                />
              </div>
            ))}
            <div className="modal-actions">
              <button onClick={handleAddCustomer}>Save</button>
              <button onClick={() => setShowAddModal(false)}>Cancel</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
});

export default ProductCustomerSection;
