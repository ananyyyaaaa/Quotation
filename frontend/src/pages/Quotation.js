import React, { useState, useRef, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import ProductCustomerSection from "./ProductCustomerSection";
import BlocksSection from "./BlocksSections";
import Page from "./Page";
import PopupContainer from "../components/PopupContainer";
import { usePopupManager } from "../hooks/usePopupManager";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";
import "./Quotation.css";

const Quotation = ({ onLogout, mode }) => {
  const { id } = useParams();
  const navigate = useNavigate();
  const urlParams = new URLSearchParams(window.location.search);
  const urlMode = urlParams.get("mode") || "edit";
  const isViewMode = urlMode === "view" || id ? urlMode === "view" : false;
  
  console.log("Quotation component rendered with onLogout:", !!onLogout);
  console.log("Current time:", new Date().toLocaleString());
  console.log("Quotation ID:", id, "Mode:", urlMode, "View Mode:", isViewMode);
  
  const [quotationNumber, setQuotationNumber] = useState("");
  const [date, setDate] = useState("");
  const [status, setStatus] = useState("Draft");
  const [businessUnit, setBusinessUnit] = useState("Ambala Unit");
  const [printData, setPrintData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [settings, setSettings] = useState(null);

  const { popups, showSuccess, showError, showWarning, showInfo, hidePopup } = usePopupManager();

  const blocksRef = useRef();
  const customerRef = useRef();
  const printRef = useRef();

  useEffect(() => {
    setDate(new Date().toISOString().split("T")[0]);
    loadSettings();
    if (id) {
      loadQuotation(id);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const loadSettings = async () => {
    try {
      const token = localStorage.getItem("token");
      const API_BASE_URL=process.env.REACT_APP_BACKEND_URL;
      const response = await fetch(`${API_BASE_URL}/api/settings`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      if (response.ok) {
        const data = await response.json();
        if (data.success && data.settings) {
          setSettings(data.settings);
        }
      }
    } catch (error) {
      console.error("Error loading settings:", error);
    }
  };


  const loadQuotation = async (quotationId) => {
    try {
      setLoading(true);
      const token = localStorage.getItem("token");
      const API_BASE_URL=process.env.REACT_APP_BACKEND_URL;
      const response = await fetch(`${API_BASE_URL}/api/quotations/${quotationId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || "Failed to load quotation");
      }

      const quotation = data.quotation;
      setQuotationNumber(quotation.quotationNumber);
      setDate(quotation.date);
      setStatus(quotation.status);
      setBusinessUnit(quotation.businessUnit);

      // Load customer and blocks data
      if (customerRef.current && customerRef.current.loadData) {
        customerRef.current.loadData({
          product: quotation.product || "",
          quotationType: quotation.quotationType || "",
          reference: quotation.reference || "",
          designer: quotation.designer || "",
          manager: quotation.manager || "",
          shippingAddress: quotation.shippingAddress || {},
          customer: quotation.customer || null,
          remarks: quotation.remarks || "",
        });
      }
      if (blocksRef.current && blocksRef.current.loadBlocks) {
        blocksRef.current.loadBlocks(quotation.blocks || []);
      }

      // Set print data for PDF
      setPrintData({
        quotationNumber: quotation.quotationNumber,
        date: quotation.date,
        customerData: {
          customerName: quotation.customer?.name || "",
          product: quotation.product || "",
          quotationType: quotation.quotationType || "",
          reference: quotation.reference || "",
          designer: quotation.designer || "",
          manager: quotation.manager || "",
          shippingAddress: quotation.shippingAddress || {},
          billingAddress: quotation.shippingAddress || {},
        },
        blocksData: quotation.blocks || [],
        settings: settings || null,
      });

      showSuccess("Quotation loaded successfully!");
    } catch (error) {
      console.error("Error loading quotation:", error);
      showError("Error loading quotation: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleHome = () => {
    navigate("/dashboard");
  };


  const handleTestSave = () => {
    console.log("=== TEST SAVE DEBUG ===");
    console.log("blocksRef.current:", blocksRef.current);
    console.log("customerRef.current:", customerRef.current);
    
    if (blocksRef.current) {
      const blocksData = blocksRef.current.getBlocks();
      console.log("Test blocksData:", blocksData);
    }
    
    if (customerRef.current) {
      const customerData = customerRef.current.getCustomerData();
      console.log("Test customerData:", customerData);
    }
  };

  const handleSave = async () => {
    // Check if refs are available
    if (!blocksRef.current) {
      showError("Blocks section not ready. Please try again.");
      return;
    }
    
    if (!customerRef.current) {
      showError("Customer section not ready. Please try again.");
      return;
    }
    
    const blocksData = blocksRef.current.getBlocks() || [];
    const customerDataRaw = customerRef.current.getCustomerData() || {};

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
    
    // Very permissive validation - allow saving with any data
    console.log("Validation check:");
    console.log("- customerDataRaw:", customerDataRaw);
    console.log("- blocksData:", blocksData);

    // Only require that we have some data to save
    const hasAnyData = customerDataRaw.customerName || 
                      customerDataRaw.product || 
                      customerDataRaw.quotationType || 
                      customerDataRaw.reference || 
                      customerDataRaw.designer || 
                      customerDataRaw.manager || 
                      blocksData.length > 0;

    if (!hasAnyData) {
      showError("Please add some data before saving.");
      return;
    }

    const quotationPayload = {
      date,
      status,
      businessUnit,
      product: customerDataRaw.product || "DEFAULT_PRODUCT",
      quotationType: customerDataRaw.quotationType || "DEFAULT_TYPE",
      reference: customerDataRaw.reference || "DEFAULT_REF",
      designer: customerDataRaw.designer || "DEFAULT_DESIGNER",
      manager: customerDataRaw.manager || "DEFAULT_MANAGER",
      customer: customerDataRaw.customer || null,
      shippingAddress: customerDataRaw.shippingAddress || {
        gstNumber: "DEFAULT_GST",
        building: "DEFAULT_BUILDING",
        floor: "DEFAULT_FLOOR",
        nearestLandmark: "DEFAULT_LANDMARK",
        address: "DEFAULT_ADDRESS",
        mobileNumber: "DEFAULT_MOBILE"
      },
      remarks: customerDataRaw.remarks || "DEFAULT_REMARKS",
      blocks: blocksData.length > 0 ? blocksData : [{
        name: "DEFAULT_BLOCK",
        items: [{
          description: "DEFAULT_ITEM",
          unit: "MTR",
          width: 0,
          quantity: 0,
          rate: 0,
          payType: "Paid",
          itemFinish: "DEFAULT_FINISH",
          image: null,
          addons: [],
          fittings: []
        }]
      }],
    };

    console.log("=== SAVING QUOTATION ===");
    console.log("Customer Data Raw:", customerDataRaw);
    console.log("Blocks Data:", blocksData);
    console.log("Quotation Payload:", quotationPayload);

    try {
      const url = id 
        ? `${API_BASE_URL}/api/quotations/${id}`
        : `${API_BASE_URL}/api/quotations`;
      const method = id ? "PUT" : "POST";

      console.log("=== API CALL DEBUG ===");
      console.log("URL:", url);
      console.log("Method:", method);
      console.log("Payload:", JSON.stringify(quotationPayload, null, 2));

      const res = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify(quotationPayload),
      });

      console.log("Response status:", res.status);
      console.log("Response ok:", res.ok);

      const data = await res.json();
      console.log("Response data:", data);

      if (!res.ok) {
        console.error("API Error:", data);
        throw new Error(data.error || data.message || "Failed to save quotation");
      }

      // Update state with returned quotation number
      const savedQuotationNumber = data.quotation?.quotationNumber || data.quotationNumber || quotationNumber;
      setQuotationNumber(savedQuotationNumber);
      
      // Set print data with correct structure for Page component
      setPrintData({
        quotationNumber: savedQuotationNumber,
        date,
        customerData,
        blocksData,
        settings: settings || null,
      });

      showSuccess(id ? "Quotation updated successfully!" : "Quotation saved successfully!");
    } catch (err) {
      console.error("Error saving quotation:", err);
      showError("Error saving quotation: " + err.message);
    }
  };

  const handleTestPDF = () => {
    console.log("=== TEST PDF WITH SAMPLE DATA ===");
    const sampleData = {
      quotationNumber: "TEST-001",
      date: new Date().toISOString().split("T")[0],
      customerData: {
        customerName: "Test Customer",
        product: "Test Product",
        quotationType: "Test Type",
        reference: "Test Ref",
        designer: "Test Designer",
        manager: "Test Manager",
        shippingAddress: {
          building: "Test Building",
          floor: "1st Floor",
          address: "Test Address",
          nearestLandmark: "Test Landmark"
        },
        billingAddress: {
          building: "Test Building",
          floor: "1st Floor", 
          address: "Test Address",
          nearestLandmark: "Test Landmark"
        }
      },
      blocksData: [
        {
          name: "Test Block",
          items: [
            {
              description: "Test Item",
              unit: "MTR",
              width: 100,
              quantity: 2,
              rate: 500,
              payType: "Paid",
              itemFinish: "Test Finish",
              addons: [
                {
                  description: "Test Addon",
                  unit: "MTR",
                  width: 50,
                  quantity: 1,
                  rate: 200,
                  payType: "Paid",
                  itemFinish: "Test Addon Finish"
                }
              ],
              fittings: [
                {
                  brand: "Test Brand",
                  unit: "EACH",
                  width: 10,
                  quantity: 4,
                  payType: "Paid",
                  listPrice: 100,
                  description: "Test Fitting"
                }
              ]
            }
          ]
        }
      ]
    };
    
    console.log("Setting test data:", sampleData);
    setPrintData(sampleData);
    console.log("=== END TEST DATA ===");
  };

  const handleDownloadPDF = async () => {
  try {
    console.log("=== PDF DOWNLOAD START ===");
    console.log("Print data exists:", !!printData);
    console.log("Print ref exists:", !!printRef.current);
    
    // Check if we have print data
    if (!printData || (!printData.customerData && !printData.blocksData)) {
      console.log("❌ No print data available");
      showError("No quotation data available. Please save a quotation with customer and block data first.");
      return;
    }

    if (!printRef.current) {
      console.log("❌ Print ref not ready");
      showError("PDF content not ready. Please try again.");
      return;
    }
    
    console.log("✅ Data validation passed");
    console.log("Print data:", JSON.stringify(printData, null, 2));

    const element = printRef.current;

    // Check if element has content
    if (!element || element.offsetWidth === 0 || element.offsetHeight === 0) {
      console.log("Element dimensions:", { width: element?.offsetWidth, height: element?.offsetHeight });
      showError("PDF content is empty. Please ensure you have saved a quotation with proper data.");
      return;
    }

    console.log("📸 Starting canvas capture...");
    console.log("Element dimensions:", { width: element.offsetWidth, height: element.offsetHeight });
    
    // Small delay to ensure content is rendered
    await new Promise(resolve => setTimeout(resolve, 100));
    
    // Render page as canvas with improved settings
    const canvas = await html2canvas(element, {
      scale: 2, // Higher scale for better quality
      useCORS: true,
      allowTaint: true,
      backgroundColor: '#ffffff',
      logging: false,
      windowWidth: element.scrollWidth,
      windowHeight: element.scrollHeight,
    });
    
    console.log("📸 Canvas created:", { width: canvas.width, height: canvas.height });

    // Validate canvas dimensions
    if (!canvas || canvas.width === 0 || canvas.height === 0) {
      console.log("❌ Canvas is empty");
      showError("Failed to generate PDF content. Canvas is empty.");
      return;
    }

    console.log("✅ Canvas is valid, dimensions:", { width: canvas.width, height: canvas.height });
    console.log("Converting canvas to image...");

    // Convert canvas to JPEG
    const imgData = canvas.toDataURL("image/jpeg", 0.95);

    console.log("Creating PDF...");
    // Create PDF
    const pdf = new jsPDF("p", "mm", "a4");
    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pdfHeight = pdf.internal.pageSize.getHeight();
    
    // Calculate image dimensions in PDF
    const imgWidth = pdfWidth - 20; // Leave 10mm margin on each side
    const imgHeight = (canvas.height * imgWidth) / canvas.width;

    console.log("📄 PDF dimensions:", { imgWidth, imgHeight });

    // Add image to PDF
    if (imgHeight <= pdfHeight - 20) {
      console.log("📄 Single page PDF");
      // Single page
      pdf.addImage(imgData, "JPEG", 10, 10, imgWidth, imgHeight);
    } else {
      console.log("📄 Multi-page PDF");
      // Multiple pages
      let heightLeft = imgHeight;
      let position = 10;

      while (heightLeft > 0) {
        const pageHeight = pdfHeight - 20;
        const currentHeight = Math.min(heightLeft, pageHeight);
        
        pdf.addImage(imgData, "JPEG", 10, position, imgWidth, currentHeight);
        
        heightLeft -= pageHeight;
        if (heightLeft > 0) {
          pdf.addPage();
          position = 10 - (imgHeight - heightLeft);
        }
      }
    }

    // Save PDF
    const fileName = `${printData?.quotationNumber || "quotation"}.pdf`;
    console.log("💾 Saving PDF:", fileName);
    pdf.save(fileName);
    
    console.log("✅ PDF saved successfully");
    console.log("=== PDF DOWNLOAD END ===");
    showSuccess("PDF downloaded successfully!");
  } catch (error) {
    console.error("❌ Error generating PDF:", error);
    console.error("Error stack:", error.stack);
    showError("Error generating PDF: " + error.message);
  }
};


  return (
    <div className="quotation-page">
      <PopupContainer popups={popups} onClose={hidePopup} />
      
      {/* Header */}
      <div className="quotation-header">
        <div className="left-header">
          <button className="save-btn" onClick={handleHome}>🏠 Home</button>
          {!isViewMode && <button className="save-btn" onClick={handleSave}>Save</button>}
          <button className="save-btn" onClick={handleDownloadPDF}>Download PDF</button>
          <button className="save-btn" onClick={handleTestSave} style={{ backgroundColor: "#10b981" }}>Test Save</button>
        </div>

        <div className="right-header">
          <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: 8, gap: 8 }}>
            {isViewMode && <span style={{ padding: "8px 16px", background: "#3b82f6", color: "white", borderRadius: "8px", fontSize: "14px", fontWeight: "600" }}>👁️ View Mode</span>}
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
              <select value={status} onChange={(e) => setStatus(e.target.value)} disabled={isViewMode}>
                <option value="Draft">Draft</option>
                <option value="Prepared">Prepared</option>
                <option value="Verified">Verified</option>
                <option value="Accepted">Accepted</option>
                <option value="Rejected">Rejected</option>
              </select>
            </div>

            <div className="header-field">
              <label>Business Unit</label>
              <select value={businessUnit} onChange={(e) => setBusinessUnit(e.target.value)} disabled={isViewMode}>
                <option value="Ambala Unit">Ambala Unit</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Sections */}
      <div className="quotation-section">
        <details open={true}>
          <summary>Product Selection and Customer KYC</summary>
          <ProductCustomerSection ref={customerRef} readOnly={isViewMode} />
        </details>

        <details open={true}>
          <summary>Blocks and Block Items</summary>
          <BlocksSection ref={blocksRef} readOnly={isViewMode} />
        </details>
      </div>

      {/* Page for PDF - Always visible for PDF generation */}
      <div className="page-print" style={{ position: "absolute", left: "-9999px", visibility: "visible" }}>
        <Page ref={printRef} data={{ ...(printData || {}), settings: settings || null }} />
      </div>
      
      {/* Debug preview - only show if printData exists */}
      {printData && (
        <div style={{ marginTop: "20px", border: "2px solid #10b981", padding: "10px", backgroundColor: "#f0fdf4" }}>
          <h3 style={{ color: "#059669" }}>📄 PDF Preview Available</h3>
          <p style={{ fontSize: "12px", color: "#059669" }}>
            Quotation: {printData.quotationNumber || "N/A"} | Customer: {(printData.customerData && printData.customerData.customerName) || "N/A"} | Blocks: {printData.blocksData ? printData.blocksData.length : 0}
          </p>
        </div>
      )}
    </div>
  );
};

export default Quotation;
