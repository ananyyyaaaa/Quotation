import React, { useState, useRef, useEffect } from "react";
import ProductCustomerSection from "./ProductCustomerSection";
import BlocksSection from "./BlocksSections";
import Page from "./Page";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";
import "./Quotation.css";

const Quotation = ({ onLogout }) => {
  const [quotationNumber, setQuotationNumber] = useState("");
  const [date, setDate] = useState("");
  const [status, setStatus] = useState("Draft");
  const [businessUnit, setBusinessUnit] = useState("Ambala Unit");
  const [printData, setPrintData] = useState(null);

  const blocksRef = useRef();
  const customerRef = useRef();
  const printRef = useRef();

  useEffect(() => {
    setDate(new Date().toISOString().split("T")[0]);
  }, []);

  const handleSave = async () => {
    const blocksData = blocksRef.current?.getBlocks() || [];
    const customerDataRaw = customerRef.current?.getCustomerData() || {};

    // Build the full customer data for PDF
    const customerData = {
      customer: customerDataRaw.customerName || "",
      product: customerDataRaw.product || "",
      quotationType: customerDataRaw.quotationType || "",
      reference: customerDataRaw.reference || "",
      designer: customerDataRaw.designer || "",
      manager: customerDataRaw.manager || "",
      shippingAddress: customerDataRaw.shippingAddress || {},
      billingAddress: customerDataRaw.billingAddress || {},
    };

    const quotationPayload = {
      date,
      status,
      businessUnit,
      customer: customerDataRaw._id || null, // store only reference in DB
      customerData, // full data for PDF
      blocksData,
    };

    try {
      const res = await fetch("http://localhost:8000/api/quotations", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify(quotationPayload),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to save quotation");

      // Update state with returned quotation number
      const savedQuotationNumber = data.quotation.quotationNumber || quotationNumber;
      setQuotationNumber(savedQuotationNumber);
      setPrintData({ ...quotationPayload, quotationNumber: savedQuotationNumber });

      alert("✅ Quotation saved successfully!");
      console.log("Saved quotation data:", { ...quotationPayload, quotationNumber: savedQuotationNumber });
    } catch (err) {
      console.error("Error saving quotation:", err);
      alert("❌ Error saving quotation: " + err.message);
    }
  };

const handleDownloadPDF = async () => {
  if (!printRef.current) return;

  const element = printRef.current;

  // Render page as canvas
  const canvas = await html2canvas(element, {
    scale: 2,
    useCORS: true,
    allowTaint: true, // important for cross-origin images
  });

  // Convert canvas to JPEG instead of PNG (more stable)
  const imgData = canvas.toDataURL("image/jpeg", 1.0); // JPEG avoids PNG signature issues

  const pdf = new jsPDF("p", "mm", "a4");
  const pdfWidth = pdf.internal.pageSize.getWidth();
  const pdfHeight = (canvas.height * pdfWidth) / canvas.width;

  if (pdfHeight > pdf.internal.pageSize.getHeight()) {
    let heightLeft = pdfHeight;
    let position = 0;

    while (heightLeft > 0) {
      pdf.addImage(imgData, "JPEG", 0, position, pdfWidth, pdfHeight);
      heightLeft -= pdf.internal.pageSize.getHeight();
      if (heightLeft > 0) pdf.addPage();
      position = -pdf.internal.pageSize.getHeight() * (pdfHeight - heightLeft) / pdfHeight;
    }
  } else {
    pdf.addImage(imgData, "JPEG", 0, 0, pdfWidth, pdfHeight);
  }

  pdf.save(`${quotationNumber || "quotation"}.pdf`);
};


  return (
    <div className="quotation-page">
      {/* Header */}
      <div className="quotation-header">
        <div className="left-header">
          <button className="save-btn" onClick={handleSave}>Save</button>
          <button className="save-btn" onClick={handleDownloadPDF}>Download PDF</button>
        </div>

        <div className="right-header">
          <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: 8 }}>
            <button className="save-btn" onClick={onLogout}>Logout</button>
          </div>

          <div className="header-row">
            <div className="header-field">
              <label># Quotation:</label>
              <span className="quotation-number">{quotationNumber || "Will be generated on save"}</span>
            </div>

            <div className="header-field">
              <label># Dated:</label>
              <input type="date" value={date} readOnly />
            </div>

            <div className="header-field">
              <label>Status</label>
              <select value={status} onChange={(e) => setStatus(e.target.value)}>
                <option value="Draft">Draft</option>
                <option value="Prepared">Prepared</option>
                <option value="Verified">Verified</option>
                <option value="Accepted">Accepted</option>
                <option value="Rejected">Rejected</option>
              </select>
            </div>

            <div className="header-field">
              <label>Business Unit</label>
              <select value={businessUnit} onChange={(e) => setBusinessUnit(e.target.value)}>
                <option value="Ambala Unit">Ambala Unit</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Sections */}
      <div className="quotation-section">
        <details>
          <summary>Product Selection and Customer KYC</summary>
          <ProductCustomerSection ref={customerRef} />
        </details>

        <details>
          <summary>Blocks and Block Items</summary>
          <BlocksSection ref={blocksRef} />
        </details>
      </div>

      {/* Hidden Page for PDF */}
      <div className="page-print" style={{ display: "none" }}>
        <Page ref={printRef} data={printData || {}} />
      </div>
    </div>
  );
};

export default Quotation;
