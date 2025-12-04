  import React, { useState, useRef, useEffect } from "react";
  import { useParams, useNavigate } from "react-router-dom";
  import ProductCustomerSection from "./ProductCustomerSection";
  import BlocksSection from "./BlocksSections";
  import PopupContainer from "../components/PopupContainer";
  import { usePopupManager } from "../hooks/usePopupManager";
  import "./Quotation.css";
  import Page from "./Page";
  import { renderToHTML, imageToBase64 } from "../utils/renderToHTML";


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
    const billRef = useRef();

    // ===== Bill Table States (mirror Page.js) =====
    const [gstPercent, setGstPercent] = useState(0);
    const [specialDiscount, setSpecialDiscount] = useState(0);
    const [woodworkValue, setWoodworkValue] = useState(0);
    const [addonValue, setAddonValue] = useState(0);
    const [fittingsValue, setFittingsValue] = useState(0);
    const [appliancesValue] = useState(0);
    const cartage = 0;
    const packing = 0;
    const installation = 0;

    const recalcFromBlocks = () => {
      try {
        const blocks = blocksRef?.current?.getBlocks?.() || [];
        let ww = 0;
        let ad = 0;
        let fit = 0;
        blocks.forEach(block => {
          (block.items || []).forEach(item => {
            ww += (Number(item.quantity) || 0) * (Number(item.rate) || 0);
            (item.addons || []).forEach(addon => {
              ad += (Number(addon.quantity) || 0) * (Number(addon.rate) || 0);
            });
            (item.fittings || []).forEach(f => {
              fit += (Number(f.quantity) || 0) * (Number(f.listPrice || f.rate) || 0);
            });
          });
        });
        setWoodworkValue(ww);
        setAddonValue(ad);
        setFittingsValue(fit);
      } catch (e) {}
    };

    useEffect(() => {
      const t = setInterval(recalcFromBlocks, 400);
      return () => clearInterval(t);
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const grossValue = woodworkValue + cartage + packing + installation;
    const gstAmount = (grossValue * gstPercent) / 100;
    const woodworkTotal = grossValue + gstAmount;
    const totalProjectValue = woodworkTotal + fittingsValue + appliancesValue + addonValue;
    const finalTotal = Math.max(0, totalProjectValue - Number(specialDiscount || 0));

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
        setSpecialDiscount(quotation.specialDiscount || 0);
        // finalProjectValue is handled in printData below


        // Load customer and blocks data
        if (customerRef.current && customerRef.current.loadData) {
          customerRef.current.loadData({
            category: quotation.category || "",
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

        // Get category from customerRef if available (after a small delay to ensure it's loaded)
        setTimeout(() => {
          const customerDataFromRef = customerRef.current?.getCustomerData?.() || {};
          const categoryFromRef = customerDataFromRef.category || quotation.category || "";

          // Set print data for PDF
          setPrintData({
            quotationNumber: quotation.quotationNumber,
            date: quotation.date,
            customerData: {
              customerName: quotation.customer?.name || "",
              category: categoryFromRef,
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
            specialDiscount: quotation.specialDiscount || 0,
            finalProjectValue: quotation.finalProjectValue || Math.max(0, totalProjectValue - Number(quotation.specialDiscount || 0)),
          });
        }, 100);

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
        category: customerDataRaw.category || "",
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
        category: customerDataRaw.category || "",
        product: customerDataRaw.product || "DEFAULT_PRODUCT",
        quotationType: customerDataRaw.quotationType || "Original",
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
        specialDiscount: Number(specialDiscount) || 0,
        finalProjectValue: Math.max(0, totalProjectValue - Number(specialDiscount || 0)),
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

      const API_BASE_URL=process.env.REACT_APP_BACKEND_URL;
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

        // Update state with returned quotation data
        const savedQuotation = data.quotation;
        setQuotationNumber(savedQuotation.quotationNumber);
        setSpecialDiscount(savedQuotation.specialDiscount || 0);

        // Get category from customerRef to ensure it's included
        const currentCustomerData = customerRef.current?.getCustomerData?.() || {};
        const categoryFromRef = currentCustomerData.category || customerData.category || "";

        // Set print data with correct structure for Page component
        setPrintData({
          quotationNumber: savedQuotation.quotationNumber,
          date,
          customerData: {
            ...customerData,
            category: categoryFromRef, // Ensure category is included
          },
          blocksData,
          settings: settings || null,
          specialDiscount: savedQuotation.specialDiscount || 0,
          finalProjectValue: Math.max(0, totalProjectValue - Number(savedQuotation.specialDiscount || 0)),
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

    // Show print preview (like Ctrl+P)
    const handlePrintPreview = (quotationNumber) => {
      if (!printRef.current) {
        showError("PDF content not ready. Please try again.");
        return;
      }
      
      // Create a new window with the print content
      const printWindow = window.open("", "_blank");
      const element = printRef.current.cloneNode(true);
      
      // Get computed styles and inline them
      const styles = Array.from(document.styleSheets)
        .map(sheet => {
          try {
            return Array.from(sheet.cssRules)
              .map(rule => rule.cssText)
              .join("\n");
          } catch (e) {
            return "";
          }
        })
        .join("\n");
      
      printWindow.document.write(`
        <!DOCTYPE html>
        <html>
          <head>
            <title>${quotationNumber || "Quotation"}</title>
            <style>${styles}</style>
          </head>
          <body>
            ${element.outerHTML}
          </body>
        </html>
      `);
      
      printWindow.document.close();
      
      // Trigger print dialog after content loads
      setTimeout(() => {
        printWindow.print();
      }, 250);
    };

    const handleDownloadPDF = async () => {
    try {
      console.log("=== PDF DOWNLOAD START ===");
      setLoading(true);
      
      // Check if we have print data
      if (!printData || (!printData.customerData && !printData.blocksData)) {
        console.log("❌ No print data available");
        showError("No quotation data available. Please save a quotation with customer and block data first.");
        setLoading(false);
        return;
      }

      if (!printRef.current) {
        console.log("❌ Print ref not ready");
        showError("PDF content not ready. Please try again.");
        setLoading(false);
        return;
      }
      
      // Get the latest category from customerRef to ensure it's up to date
      const currentCustomerData = customerRef.current?.getCustomerData?.() || {};
      const latestCategory = currentCustomerData.category || printData.customerData?.category || "";
      
      console.log("📋 Category check - Latest:", latestCategory);
      
      // ALWAYS update printData with latest category before generating PDF
      const updatedPrintData = {
        ...printData,
        customerData: {
          ...printData.customerData,
          category: latestCategory,
        },
        specialDiscount: specialDiscount || 0,
        gstPercent: gstPercent || 0,
      };
      
      // Update state immediately
      setPrintData(updatedPrintData);
      
      // Wait for state to update and component to re-render
      await new Promise(resolve => setTimeout(resolve, 300));

      // First show print preview
      handlePrintPreview(updatedPrintData?.quotationNumber);
      
      // Then generate PDF via backend
      const element = printRef.current;

      // Check if element has content
      if (!element || element.offsetWidth === 0 || element.offsetHeight === 0) {
        console.log("Element dimensions:", { width: element?.offsetWidth, height: element?.offsetHeight });
        showError("PDF content is empty. Please ensure you have saved a quotation with proper data.");
        setLoading(false);
        return;
      }

      // Fetch CSS content
      const cssResponse = await fetch("/src/pages/Page.css");
      let cssContent = "";
      if (cssResponse.ok) {
        cssContent = await cssResponse.text();
      } else {
        // Fallback: try to get CSS from style sheets
        cssContent = Array.from(document.styleSheets)
          .map(sheet => {
            try {
              return Array.from(sheet.cssRules)
                .map(rule => rule.cssText)
                .join("\n");
            } catch (e) {
              return "";
            }
          })
          .join("\n");
      }

      // Collect all images and convert to base64
      const imageMap = {};
      const logoImg = element.querySelector(".company-logo");
      if (logoImg && logoImg.src) {
        try {
          imageMap.logo = await imageToBase64(logoImg.src);
        } catch (e) {
          console.warn("Failed to convert logo to base64:", e);
        }
      }

      // Collect item images
      const itemImages = element.querySelectorAll(".block-image");
      for (const img of itemImages) {
        if (img.src && !imageMap[img.src]) {
          try {
            imageMap[img.src] = await imageToBase64(img.src);
          } catch (e) {
            console.warn("Failed to convert image to base64:", e);
          }
        }
      }

      // Generate HTML from React component
      const html = await renderToHTML(Page, {
        data: {
          ...updatedPrintData,
          settings: settings || null,
        }
      }, cssContent, imageMap);

      console.log("✅ HTML generated, sending to backend...");

      // Send HTML to backend for PDF generation
      const token = localStorage.getItem("token");
      const API_BASE_URL = process.env.REACT_APP_BACKEND_URL;
      const fileName = `${updatedPrintData?.quotationNumber || "quotation"}.pdf`;

      const response = await fetch(`${API_BASE_URL}/api/pdf/generate`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          html,
          filename: fileName,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to generate PDF");
      }

      // Download PDF
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = fileName;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);

      console.log("✅ PDF downloaded successfully");
      showSuccess("PDF downloaded successfully!");
      setLoading(false);
    } catch (error) {
      console.error("❌ Error generating PDF:", error);
      console.error("Error stack:", error.stack);
      showError("Error generating PDF: " + error.message);
      setLoading(false);
    }
  };

  return (
      <div className="quotation-page">
        <PopupContainer popups={popups} onClose={hidePopup} />
        
        {/* Header */}
        <div className="quotation-header">
          <div className="left-header">
            <button className="save-btn" onClick={handleHome}>Home</button>
            {!isViewMode && <button className="save-btn" onClick={handleSave}>Save</button>}
            <button className="save-btn" onClick={handleDownloadPDF}>Download PDF</button>
            {/* <button className="save-btn" onClick={handleTestSave} style={{ backgroundColor: "#10b981" }}>Test Save</button> */}
          </div>

          <div className="right-header">
            <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: 8, gap: 8 }}>
              {isViewMode && <span className="save-btn">View Mode</span>}
              {/* <button className="save-btn" onClick={onLogout}>🔓 Logout</button> */}
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

        <details open={true}>
            <summary>Bill Summary</summary>
            <div className="bill-summary">
              <div className="bill-card">
                <table>
                  <tbody>
                    <tr>
                      <td>WoodWork Value (A)</td>
                      <td>₹ {woodworkValue.toLocaleString()}</td>
                    </tr>
                    <tr>
                      <td>Cartage</td>
                      {/* <td>₹ {cartage.toLocaleString()}</td> */}
                      <td>As Per Actual</td>
                    </tr>
                    <tr>
                      <td>Packing</td>
                      {/* <td>₹ {packing.toLocaleString()}</td> */}
                      <td>As Per Actual</td>
                    </tr>
                    <tr>
                      <td>Installation</td>
                      {/* <td>₹ {installation.toLocaleString()}</td> */}
                      <td>As Per Actual</td>
                    </tr>
                    <tr>
                      <td><b>Gross Value</b></td>
                      <td><b>₹ {grossValue.toLocaleString()}</b></td>
                    </tr>
                    {/* <tr>
                      <td>GST (%)</td>
                      <td>
                        <input
                          type="number"
                          value={gstPercent}
                          onChange={(e) => setGstPercent(e.target.value)}
                          placeholder="0"
                        />
                      </td>
                    </tr> */}
                    <tr>
                      <td>GST Amount</td>
                      {/* <td>₹ {gstAmount.toLocaleString()}</td> */}
                      <td>As Per Actual</td>
                    </tr>
                    <tr>
                      <td><b>WoodWork Total</b></td>
                      <td><b>₹ {woodworkTotal.toLocaleString()}</b></td>
                    </tr>
                    <tr>
                      <td>Fittings Value (B)</td>
                      <td>₹ {fittingsValue.toLocaleString()}</td>
                    </tr>
                    <tr>
                      <td>Appliances Value (C)</td>
                      <td>₹ {addonValue.toLocaleString()}</td>
                    </tr>
                    <tr>
                      <td><b>Total Project Value</b></td>
                      <td><b>₹ {totalProjectValue.toLocaleString()}</b></td>
                    </tr>
                    <tr>
                      <td>Special Discount</td>
                      <td>
                        {isViewMode ? (
                          <span>₹ {specialDiscount.toLocaleString()}</span>
                        ) : (
                          <input
                            type="number"
                            value={specialDiscount}
                            onChange={(e) => setSpecialDiscount(e.target.value)}
                            style={{ width: "80%", textAlign: "center" }}
                            placeholder="0"
                          />
                        )}
                      </td>
                    </tr>
                    <tr>
                      <td><b>Final Project Value</b></td>
                      <td><b>₹ {finalTotal.toLocaleString()}</b></td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </details>
        </div>

        <div className="bottom-actions">
          {!isViewMode && <button className="save-btn" onClick={handleSave}>Save</button>}
          <button className="save-btn" onClick={handleDownloadPDF}>Download PDF</button>
        </div>

        {/* Page for PDF - Always visible for PDF generation */}
        <div className="page-print" style={{ position: "absolute", left: "-9999px", visibility: "visible" }}>
          <Page 
            ref={printRef} 
            key={printData?.customerData?.category || "default"} 
            data={{ ...(printData || {}), settings: settings || null }} 
          />
        </div> 
        
        {/* Debug preview - only show if printData exists */}
        {/* {printData && (
          <div style={{ marginTop: "20px", border: "2px solid #10b981", padding: "10px", backgroundColor: "#f0fdf4" }}>
            <h3 style={{ color: "#059669" }}>📄 PDF Preview Available</h3>
            <p style={{ fontSize: "12px", color: "#059669" }}>
              Quotation: {printData.quotationNumber || "N/A"} | Customer: {(printData.customerData && printData.customerData.customerName) || "N/A"} | Blocks: {printData.blocksData ? printData.blocksData.length : 0}
            </p>
          </div>
        )} */} 
      </div>
    );
  };

  export default Quotation;
