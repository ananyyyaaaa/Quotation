import React, { useState, useEffect } from "react";
import "./Settings.css";

const Settings = () => {
  const [form, setForm] = useState({
    legalName: "",
    gstin: "",
    pan: "",
    stateCode: "",
    stateName: "",
    address: "",
    phone: "",
    email: "",
    prefix: "",
    nextNumber: "",
    defaultGst: "",
    validityDays: "",
    terms: "",
  });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState(null);

  // Fetch existing settings on component mount
  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const token = localStorage.getItem("token");
        const response = await fetch("http://localhost:8000/api/settings", {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        });

        if (response.ok) {
          const data = await response.json();
          if (data.success && data.settings) {
            setForm({
              legalName: data.settings.legalName || "",
              gstin: data.settings.gstin || "",
              pan: data.settings.pan || "",
              stateCode: data.settings.stateCode || "",
              stateName: data.settings.stateName || "",
              address: data.settings.address || "",
              phone: data.settings.phone || "",
              email: data.settings.email || "",
              prefix: data.settings.prefix || "",
              nextNumber: data.settings.nextNumber?.toString() || "",
              defaultGst: data.settings.defaultGst?.toString() || "",
              validityDays: data.settings.validityDays?.toString() || "",
              terms: data.settings.terms || "",
            });
          }
        }
      } catch (error) {
        console.error("Error fetching settings:", error);
      }
    };

    fetchSettings();
  }, []);

  const onChange = (e) => {
    const { name, value } = e.target;
    setForm((s) => ({ ...s, [name]: value }));
  };

  const onSave = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage(null);

    try {
      const token = localStorage.getItem("token");
      const payload = {
        ...form,
        nextNumber: form.nextNumber ? parseInt(form.nextNumber) : 1,
        defaultGst: form.defaultGst ? parseFloat(form.defaultGst) : 18,
        validityDays: form.validityDays ? parseInt(form.validityDays) : 15,
      };

      const response = await fetch("http://localhost:8000/api/settings", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        setMessage({ type: "success", text: "Settings saved successfully!" });
      } else {
        setMessage({ type: "error", text: data.error || "Failed to save settings" });
      }
    } catch (error) {
      console.error("Error saving settings:", error);
      setMessage({ type: "error", text: "An error occurred while saving" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="settings-page">
      {/* Header */}
      <div className="settings-header">
        <div className="header-content">
          <div className="header-left">
            <h1>⚙️ Settings</h1>
            <p>Configure your application preferences</p>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="settings-content">
        <div className="settings-card">
          <form onSubmit={onSave}>
            <div className="settings-form-container">
              <h1>Company Profile (India)</h1>

              {message && (
                <div className={message.type === "success" ? "alert-success" : "alert-error"}>
                  {message.text}
                </div>
              )}

              <section className="grid grid-cols-2">
                <div>
                  <label>Legal Name</label>
                  <input
                    name="legalName"
                    value={form.legalName}
                    onChange={onChange}
                    placeholder="Enter legal company name"
                  />
                </div>

                <div>
                  <label>GSTIN</label>
                  <input
                    name="gstin"
                    value={form.gstin}
                    onChange={onChange}
                    placeholder="Enter GSTIN (eg. 07AAAAA0000A1Z5)"
                  />
                </div>

                <div>
                  <label>PAN</label>
                  <input
                    name="pan"
                    value={form.pan}
                    onChange={onChange}
                    placeholder="Enter PAN (eg. AAAAA0000A)"
                  />
                </div>

                <div>
                  <label>State Code</label>
                  <input
                    name="stateCode"
                    value={form.stateCode}
                    onChange={onChange}
                    placeholder="Enter state code (eg. 07)"
                  />
                </div>

                <div>
                  <label>State Name</label>
                  <input
                    name="stateName"
                    value={form.stateName}
                    onChange={onChange}
                    placeholder="Enter state name (eg. Delhi)"
                  />
                </div>

                <div>
                  <label>Phone</label>
                  <input
                    name="phone"
                    value={form.phone}
                    onChange={onChange}
                    placeholder="Enter phone number (eg. +91-9876543210)"
                    type="tel"
                  />
                </div>

                <div className="col-span-2">
                  <label>Address</label>
                  <textarea
                    name="address"
                    value={form.address}
                    onChange={onChange}
                    placeholder="Enter registered office address"
                    rows={3}
                  />
                </div>

                <div className="col-span-2">
                  <label>Email</label>
                  <input
                    name="email"
                    value={form.email}
                    onChange={onChange}
                    placeholder="Enter contact email (eg. info@company.com)"
                    type="email"
                  />
                </div>
              </section>

              <hr />

              <section>
                <h2>Quotation Defaults</h2>

                <div className="grid grid-cols-4">
                  <div>
                    <label>Prefix</label>
                    <input
                      name="prefix"
                      value={form.prefix}
                      onChange={onChange}
                      placeholder="Eg. QTN-"
                    />
                  </div>

                  <div>
                    <label>Next Number</label>
                    <input
                      name="nextNumber"
                      value={form.nextNumber}
                      onChange={onChange}
                      placeholder="Eg. 1001"
                      type="number"
                    />
                  </div>

                  <div>
                    <label>Default GST %</label>
                    <input
                      name="defaultGst"
                      value={form.defaultGst}
                      onChange={onChange}
                      placeholder="Eg. 18"
                      type="number"
                      step="0.01"
                    />
                  </div>

                  <div>
                    <label>Validity (days)</label>
                    <input
                      name="validityDays"
                      value={form.validityDays}
                      onChange={onChange}
                      placeholder="Eg. 30"
                      type="number"
                    />
                  </div>

                  <div className="col-span-4">
                    <label>Terms (one per line)</label>
                    <textarea
                      name="terms"
                      value={form.terms}
                      onChange={onChange}
                      placeholder="Enter each term on a new line&#10;Eg. Payment due within 30 days&#10;Delivery within 2 weeks"
                      rows={5}
                    />
                  </div>
                </div>
              </section>

              <div className="flex">
                <button
                  type="button"
                  onClick={() => setForm({
                    legalName: "",
                    gstin: "",
                    pan: "",
                    stateCode: "",
                    stateName: "",
                    address: "",
                    phone: "",
                    email: "",
                    prefix: "",
                    nextNumber: "",
                    defaultGst: "",
                    validityDays: "",
                    terms: "",
                  })}
                >
                  Reset
                </button>

                <button
                  type="submit"
                  disabled={loading}
                >
                  {loading ? "Saving..." : "Save"}
                </button>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Settings;
