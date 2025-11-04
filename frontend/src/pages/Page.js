import React, { forwardRef, useState } from "react";
import "./Page.css";
import logo from "./logo.png";

const Page = forwardRef(({ data = {} }, ref) => {
  console.log("=== PAGE COMPONENT DEBUG ===");
  console.log("Page component received data:", data);
  
  const {
    quotationNumber = "___________",
    date = "__________________",
    customerData = {},
    blocksData = [],
    settings = null,
  } = data;

  const customer = customerData.customerName || customerData.customer || "";
  const d = new Date(date);
  const isValidDate = !isNaN(d.getTime());
  const baseDate = isValidDate ? d : new Date();
  const months = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
  const year = baseDate.getFullYear();
  const month = months[baseDate.getMonth()];
  const validTillDate = new Date(baseDate);
  validTillDate.setDate(baseDate.getDate() + 15);
  const validTill = `${validTillDate.getDate()} ${months[validTillDate.getMonth()]} ${validTillDate.getFullYear()}`;
  const { shippingAddress = {}, billingAddress = {} } = customerData;

  // ===== STATES =====
  const [specialDiscount, setSpecialDiscount] = useState(0);
  const [gstPercent, setGstPercent] = useState(0);

  // ===== CALCULATIONS =====
  let woodworkValue = 0;
  let addonValue = 0;
  let fittingsValue = 0;
  let appliancesValue = 0;

  blocksData.forEach(block => {
    block.items?.forEach(item => {
      const itemAmount = (item.quantity || 0) * (item.rate || 0);
      woodworkValue += itemAmount;

      item.addons?.forEach(addon => {
        addonValue += (addon.quantity || 0) * (addon.rate || 0);
      });

      item.fittings?.forEach(fit => {
        fittingsValue += (fit.quantity || 0) * (fit.listPrice || fit.rate || 0);
      });
    });
  });

  const cartage = 0;
  const packing = 0;
  const installation = 0;

  const grossValue = woodworkValue + cartage + packing + installation;
  const gstAmount = (grossValue * gstPercent) / 100;
  const woodworkTotal = grossValue + gstAmount;
  const totalProjectValue = woodworkTotal + fittingsValue + addonValue + appliancesValue;
  const finalTotal = Math.max(0, totalProjectValue - Number(specialDiscount || 0));

  // ===== Number to Words =====
  const numberToWords = (num) => {
    const a = [
      '', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine', 'Ten',
      'Eleven', 'Twelve', 'Thirteen', 'Fourteen', 'Fifteen', 'Sixteen', 'Seventeen',
      'Eighteen', 'Nineteen'
    ];
    const b = ['', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety'];
    const numToWords = (n) => {
      if (n < 20) return a[n];
      if (n < 100) return b[Math.floor(n / 10)] + (n % 10 ? ' ' + a[n % 10] : '');
      if (n < 1000) return a[Math.floor(n / 100)] + ' Hundred' + (n % 100 ? ' ' + numToWords(n % 100) : '');
      if (n < 100000) return numToWords(Math.floor(n / 1000)) + ' Thousand' + (n % 1000 ? ' ' + numToWords(n % 1000) : '');
      if (n < 10000000) return numToWords(Math.floor(n / 100000)) + ' Lakh' + (n % 100000 ? ' ' + numToWords(n % 100000) : '');
      return numToWords(Math.floor(n / 10000000)) + ' Crore' + (n % 10000000 ? ' ' + numToWords(n % 10000000) : '');
    };
    return num === 0 ? 'Zero' : numToWords(num);
  };

  const amountInWords = `${numberToWords(finalTotal)} Only`;

  return (
    <div className="page-container" ref={ref}>
      {/* HEADER */}
      <div className="header-section">
        <div className="logo-container">
          <img src={logo} alt="Company Logo" className="company-logo" />
          {(() => {
            const cat = String(customerData.category || "").toLowerCase();
            if (cat.includes("kitchen")) return <p>Kitchen</p>;
            if (cat.includes("wardrobe")) return <p>Wardrobe</p>;
            return null;
          })()}
        </div>
        <div className="address-container">
          <b>
            <p>{settings?.legalName || "Manan Resources"}</p>
            <p>{settings?.address || "Showroom: 297-A First Floor, Above Honda Showroom\nModel Town, Ambala City, 134003, Haryana, India"}</p>
            {settings?.email || <p>Email: info.mananresources@gmail.com</p>}
            {settings?.phone || <p>Contact: +91-8146428915</p>}
          </b>
        </div>
      </div>

      {/* TOP SECTION */}
      <div className="top-section">
        <div className="invoice-box">
          <b><p>INOVIK/{year}/{month}/{quotationNumber} ({customerData.quotationType || ""})</p></b>
          <p><b>Dated: </b>{d.getDate()} {month} {year}</p>
          <p><b>Reference:</b> {customerData.reference || ""}</p>
          <p><b>Designer:</b> {customerData.designer || ""}</p>
          <p><b>Handled By:</b> {customerData.manager || ""}</p>
        </div>
        <div className="shipping-box">
          <b>
            <p>Shipping Address</p>
            <p> {customer || ""}</p>
          </b>
          {shippingAddress.building && <p>{shippingAddress.building}</p>}
          {shippingAddress.floor && <p>Floor: {shippingAddress.floor}</p>}
          {shippingAddress.address && <p>{shippingAddress.address}</p>}
          {shippingAddress.nearestLandmark && <p>Landmark: {shippingAddress.nearestLandmark}</p>}
        </div>
        <div className="billing-box">
          <b>
            <p>Billing Address</p>
            <p> {customer || ""}</p>
          </b>
          {billingAddress.building || shippingAddress.building ? <p>{billingAddress.building || shippingAddress.building}</p> : null}
          {billingAddress.floor || shippingAddress.floor ? <p>Floor: {billingAddress.floor || shippingAddress.floor}</p> : null}
          {billingAddress.address || shippingAddress.address ? <p>{billingAddress.address || shippingAddress.address}</p> : null}
          {billingAddress.nearestLandmark || shippingAddress.nearestLandmark ? <p>Landmark: {billingAddress.nearestLandmark || shippingAddress.nearestLandmark}</p> : null}
        </div>
      </div>

      {/* INTRO SECTION */}
      <section className="intro-section">
        <p>Dear <b>{customer || ""}</b>,</p>
        <p>Greetings of the day!</p>
        <p>
          Based on your enquiry for <b>{customerData.category || ""}</b>, received on <b>{d.getDate()} {month} {year}</b>, 
          we are pleased to raise a proposal with reference number <b>{quotationNumber}</b>. Please check the details and revert back to us as earliest possible.
        </p>
        <p>For clarifications or queries, please feel free to contact your relationship manager at the details above.</p>
        <p>This proposal is valid for <b>15</b> days, i.e., till <b>{validTill}</b>.</p>
      </section>

      {/* BLOCKS SECTION */}
      <section className="block-section">
        {blocksData.length ? (
          blocksData.map((block, bIdx) => (
            <div key={bIdx} className="block-container">
              <h4 className="block-name">
                {`${bIdx + 1}. ${block.name || `Block ${bIdx + 1}`}`}
              </h4>
              <table className="block-table">
                <thead>
                  <tr>
                    <th>S.No.</th>
                    <th>Description</th>
                    <th>Finish</th>
                    <th>Ref. Image</th>
                    <th>Width</th>
                    <th>Height</th>
                    <th>Size/Area</th>
                    <th>UOM</th>
                    <th>Qty</th>
                    <th>Rate</th>
                    <th>Amount</th>
                  </tr>
                </thead>
                <tbody>
                  {block.items?.length ? (
                    block.items.map((item, iIdx) => (
                      <React.Fragment key={iIdx}>
                        {/* Main Item */}
                        <tr>
                          <td>{`${bIdx + 1}`}</td>
                          <td>{item.description || ""}</td>
                          <td>{item.itemFinish || item.finish || "-"}</td>
                          <td>
                            {item.image && (
                              <img
                                src={item.image}
                                alt="Item"
                                className="block-image"
                              />
                            )}
                          </td>
                          <td>{item.width || ""}</td>
                          <td>{item.height || ""}</td>
                          <td>As Per Drawing</td>
                          <td>{item.unit || ""}</td>
                          <td>{item.quantity || ""}</td>
                          <td>{item.rate || ""}</td>
                          <td>{(item.quantity || 0) * (item.rate || 0)}</td>
                        </tr>

                        {/* Addons Section */}
                        {item.addons?.length > 0 && (
                          <tr>
                            <td colSpan={11} className="block-merged-row">
                              Addon Item(s) associated with {`${item.description || `Item ${iIdx + 1}`}`}
                            </td>
                          </tr>
                        )}
                        {item.addons?.map((addon, aIdx) => (
                          <tr key={`addon-${aIdx}`} className="addon-row">
                            <td>{`${bIdx + 1}.${(aIdx + 1).toString().padStart(2, "0")}`}</td>
                            <td>{addon.description || "-"}</td>
                            <td>{addon.itemFinish || addon.finish || "-"}</td>
                            <td>
                              {addon.image && (
                                <img
                                  src={addon.image}
                                  alt="Addon"
                                  className="block-image"
                                />
                              )}
                            </td>
                            <td>{addon.width || ""}</td>
                            <td>{addon.height || ""}</td>
                            <td>As Per Drawing</td>
                            <td>{addon.unit || ""}</td>
                            <td>{addon.quantity || ""}</td>
                            <td>{addon.rate || ""}</td>
                            <td>{(addon.quantity || 0) * (addon.rate || 0)}</td>
                          </tr>
                        ))}

                        {/* Fittings Section */}
                        {item.fittings?.length > 0 && (
                          <tr>
                            <td colSpan={11} className="block-merged-row">
                              Hardware Item(s) associated with {`${item.description || `Item ${iIdx + 1}`}`}
                            </td>
                          </tr>
                        )}
                        {item.fittings?.map((fit, fIdx) => (
                          <tr key={`fit-${fIdx}`} className="fitting-row">
                            <td>{`${bIdx + 1}.${fIdx + 1}`}</td>
                            <td>{fit.description || ""}</td>
                            <td>{fit.brand || ""}</td>
                            <td>
                              {fit.image && (
                                <img
                                  src={fit.image}
                                  alt="Fitting"
                                  className="block-image"
                                />
                              )}
                            </td>
                            <td>{fit.width || ""}</td>
                            <td>{fit.height || ""}</td>
                            <td>As Per Drawing</td>
                            <td>{fit.unit || ""}</td>
                            <td>{fit.quantity || "-"}</td>
                            <td>{fit.listPrice || fit.rate || "-"}</td>
                            <td>
                              {(fit.quantity || 0) * (fit.listPrice || fit.rate || 0)}
                            </td>
                          </tr>
                        ))}
                      </React.Fragment>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={11} style={{ textAlign: "center" }}>
                        No items added
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          ))
        ) : (
          <p>No blocks added</p>
        )}
      </section>

      {/* NOTES & TERMS + RIGHT BILL TABLE */}
      <section className="notes-and-terms-section" style={{ display: "flex", gap: "20px", marginTop: "20px" }}>
        <div className="notes-terms-left" style={{ flex: 1, pageBreakInside: "avoid" }}>
          <div className="special-notes-box">
            <h4>Special Notes</h4>
            {settings && settings.terms && settings.terms.trim() ? (
              <p style={{ whiteSpace: "pre-line" }}>
                {settings.terms.split('\n').map((line, index) => (
                  <React.Fragment key={index}>
                    {line}
                    <br/>
                  </React.Fragment>
                ))}
              </p>
            ) : (
              <p>
                1. Please review all measurements carefully.<br/>
                2. Changes after production may incur extra charges.<br/>
                3. Delivery schedules may vary depending on material availability.
              </p>
            )}
            {(() => {
              const cat = String(customerData.category || "").toLowerCase();
              if (cat.includes("kitchen")) return <p>This is the kitchen.</p>;
              if (cat.includes("wardrobe")) return <p>Wardrobe.</p>;
              return null;
            })()}
          </div>

          <footer className="terms-box">
            <h4>Terms and Conditions</h4>
            <p>
              1. All Purchase Order, Cheque, and Draft to be made in the Favour of 'Manan Resources'.<br/>
              2. 60% advance at the time of placing the order, 35% payment before dispatch of goods, 5% after installation.<br/>
              3. Delivery will be within 4 to 6 weeks days after confirmation of the order and final measurement done, with advance, subject to availability of raw material.<br/>
              4. Delivery is subject to realization of cheque / DD or Cash.<br/>
              5. Goods once sold can't be returned or exchanged.<br/>
              6. Cancellation of confirmed order is not allowed and advance is non-refundable.<br/>
              7. For delivery on or above five floors, the service lift shall have to be organized by the client.<br/>
              8. The lighting part and Glass is not covered under any kind of warranty.<br/>
              9. Any paper regarding transportation, if required, to be provided by the client.<br/>
              10. Taxes and transportation are extra as Applicable.<br/>
              11. Prices are valid for 15 days.<br/>
              12. All disputes will be subjected to Ambala Jurisdiction only.<br/>
              13. There will be no guarantee of broken items.<br/>
              14. There will be 5 Years of warranty on all products.<br/>
              15. 2 Visits are free after that chargeable.
            </p>
          </footer>
        </div>

        <div className="right-table" style={{ flex: 0.8, pageBreakInside: "avoid", textAlign: "center" }}>
          <table style={{ margin: "0 auto" }}>
            <tbody>
              <tr>
                <td>WoodWork Value</td>
                <td>₹ {woodworkValue.toLocaleString()}</td>
              </tr>
              <tr>
                <td>Cartage</td>
                <td>₹ {cartage.toLocaleString()}</td>
              </tr>
              <tr>
                <td>Packing</td>
                <td>₹ {packing.toLocaleString()}</td>
              </tr>
              <tr>
                <td>Installation</td>
                <td>₹ {installation.toLocaleString()}</td>
              </tr>
              <tr>
                <td><b>Gross Value</b></td>
                <td><b>₹ {grossValue.toLocaleString()}</b></td>
              </tr>
              <tr>
                <td>GST (%)</td>
                <td>
                  <input
                    type="number"
                    value={gstPercent}
                    onChange={(e) => setGstPercent(e.target.value)}
                    style={{ width: "80%", textAlign: "center" }}
                    placeholder="0"
                  />
                </td>
              </tr>
              <tr>
                <td>GST Amount</td>
                <td>₹ {gstAmount.toLocaleString()}</td>
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
                <td>₹ {appliancesValue.toLocaleString()}</td>
              </tr>
              <tr>
                <td><b>Total Project Value</b></td>
                <td><b>₹ {totalProjectValue.toLocaleString()}</b></td>
              </tr>
              <tr>
                <td>Special Discount</td>
                <td>
                  <input
                    type="number"
                    value={specialDiscount}
                    onChange={(e) => setSpecialDiscount(e.target.value)}
                    style={{ width: "80%", textAlign: "center" }}
                    placeholder="0"
                  />
                </td>
              </tr>
              <tr>
                <td><b>Final Project Value</b></td>
                <td><b>₹ {finalTotal.toLocaleString()}</b></td>
              </tr>
              <tr>
                <td colSpan="2"><b>In Words:</b> {amountInWords}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>


      <div className="footer-table">
  <table>
    <tbody>
      <tr>
        <td>
          <h1>Company Details</h1>
          <p>Company Name: Manan Resources</p>
          <p>Bank Details: IDFC FIRST BANK LTD, A/c No. 10205212942</p>
          <p>IFSC Code: IDFB0021392</p>
          <p>Branch Name: Ambala Cantt. Branch</p>
        </td>

        <td>
          <p>PAN: AZDPT2931P</p>
          <p>GSTIN: 06AZDPT2931P1ZV</p>
          <p>TAN:</p>
        </td>

        <td className="sign-col">
          <div className="sign-space"></div>
          <p>Auth. Signatory Sign.</p>
        </td>

        <td className="sign-col">
          <div className="sign-space"></div>
          <p>Client Sign.</p>
        </td>
      </tr>
    </tbody>
  </table>
</div>



    </div>
      
  );
});

export default Page;
