import React, { forwardRef } from "react";
import "./Page.css";
import logo from "./logo.png";

const Page = forwardRef(({ data = {} }, ref) => {
  const {
    quotationNumber = "___________",
    date = "__________________",
    customerData = {},
    blocksData = [],
  } = data;

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

  // Calculate totals
  let woodworkValue = 0;
  let addonValue = 0;
  let fittingsValue = 0;

  blocksData.forEach(block => {
    block.items?.forEach(item => {
      const itemAmount = (item.quantity || 0) * (item.rate || 0);
      woodworkValue += itemAmount;

      item.addons?.forEach(addon => {
        addonValue += (addon.quantity || 0) * (addon.rate || 0);
      });

      item.fittings?.forEach(fit => {
        fittingsValue += (fit.quantity || 0) * (fit.rate || 0);
      });
    });
  });

  const grossValue = woodworkValue + addonValue + fittingsValue;
  const totalProjectValue = grossValue;

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

  const amountInWords = `${numberToWords(totalProjectValue)} Only`;

  return (
    <div className="page-container" ref={ref} style={{ overflow: "visible" }}>
      {/* Header */}
      <div className="header-section">
        <div className="logo-container">
          <img src={logo} alt="Company Logo" className="company-logo" />
        </div>
        <div className="address-container">
          <p><b>Manan Resources</b></p>
          <p>Plot No. 5, Industrial Area Phase II</p>
          <p>Chandigarh – 160002, India</p>
          <p>Phone: +91-9876543210</p>
          <p>Email: info@mananresources.com</p>
        </div>
      </div>

      {/* Top Section */}
      <div className="top-section">
        <div className="invoice-box">
          <b><p>INOVIK/{year}/{month}/{quotationNumber} ({customerData.quotationType || ""})</p></b>
          <p><b>Dated: </b>{d.getDate()} {month} {year}</p>
          <p>Reference: {customerData.reference || ""}</p>
          <p>Designer: {customerData.designer || ""}</p>
          <p>Handled By: {customerData.manager || ""}</p>
        </div>
        <div className="shipping-box">
          <h4>Shipping Address</h4>
          <p>Mr {customerData.customer || ""}</p>
          {shippingAddress.building && <p>{shippingAddress.building}</p>}
          {shippingAddress.floor && <p>Floor: {shippingAddress.floor}</p>}
          {shippingAddress.address && <p>{shippingAddress.address}</p>}
          {shippingAddress.nearestLandmark && <p>Landmark: {shippingAddress.nearestLandmark}</p>}
        </div>
        <div className="billing-box">
          <h4>Billing Address</h4>
          <p>Mr {customerData.customer || ""}</p>
          {billingAddress.building || shippingAddress.building ? <p>{billingAddress.building || shippingAddress.building}</p> : null}
          {billingAddress.floor || shippingAddress.floor ? <p>Floor: {billingAddress.floor || shippingAddress.floor}</p> : null}
          {billingAddress.address || shippingAddress.address ? <p>{billingAddress.address || shippingAddress.address}</p> : null}
          {billingAddress.nearestLandmark || shippingAddress.nearestLandmark ? <p>Landmark: {billingAddress.nearestLandmark || shippingAddress.nearestLandmark}</p> : null}
        </div>
      </div>

      {/* Intro Section */}
      <section className="intro-section">
        <p>Dear <b>{customerData.customer || ""}</b>,</p>
        <p>Greetings of the day!</p>
        <p>
          Based on your enquiry for <b>{customerData.product || ""}</b>, received on <b>{d.getDate()} {month} {year}</b>, 
          we are pleased to raise a proposal with reference number <b>{quotationNumber}</b>. Please check the details and revert back to us as earliest possible.
        </p>
        <p>For clarifications or queries, please feel free to contact your relationship manager at the details above.</p>
        <p>This proposal is valid for <b>15</b> days, i.e., till <b>{validTill}</b>.</p>
      </section>

      {/* Blocks Section */}
      <section className="block-section">
        {blocksData.length ? (
          blocksData.map((block, bIdx) => (
            <div key={bIdx} className="block-container" style={{ pageBreakInside: "avoid" }}>
              <h4 className="block-name">{`${bIdx + 1}. ${block.name || `Block ${bIdx + 1}`}`}</h4>
              <table className="block-table">
                <thead>
                  <tr>
                    <th>S.No.</th>
                    <th>Description</th>
                    <th>Finish</th>
                    <th>Width</th>
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
                        <tr>
                          <td>{`${bIdx + 1}.${iIdx + 1}`}</td>
                          <td>{item.description || "-"}</td>
                          <td>{item.finish || "-"}</td>
                          <td>{item.width || "-"}</td>
                          <td>{item.unit || "-"}</td>
                          <td>{item.quantity || "-"}</td>
                          <td>{item.rate || "-"}</td>
                          <td>{(item.quantity || 0) * (item.rate || 0)}</td>
                        </tr>
                        {item.addons?.map((addon, aIdx) => (
                          <tr key={`addon-${aIdx}`} className="addon-row">
                            <td></td>
                            <td style={{ paddingLeft: "25px" }}>{`Addon: ${addon.description || "-"}`}</td>
                            <td>{addon.finish || "-"}</td>
                            <td>{addon.width || "-"}</td>
                            <td>{addon.unit || "-"}</td>
                            <td>{addon.quantity || "-"}</td>
                            <td>{addon.rate || "-"}</td>
                            <td>{(addon.quantity || 0) * (addon.rate || 0)}</td>
                          </tr>
                        ))}
                        {item.fittings?.map((fit, fIdx) => (
                          <tr key={`fit-${fIdx}`} className="fitting-row">
                            <td></td>
                            <td style={{ paddingLeft: "25px" }}>{`Fitting: ${fit.description || "-"}`}</td>
                            <td>{fit.finish || "-"}</td>
                            <td>{fit.width || "-"}</td>
                            <td>{fit.unit || "-"}</td>
                            <td>{fit.quantity || "-"}</td>
                            <td>{fit.rate || "-"}</td>
                            <td>{(fit.quantity || 0) * (fit.rate || 0)}</td>
                          </tr>
                        ))}
                      </React.Fragment>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={8} style={{ textAlign: "center" }}>No items added</td>
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

      {/* Notes & Terms + Right Table */}
      <section className="notes-and-terms-section" style={{ display: "flex", gap: "20px", marginTop: "20px" }}>
        <div className="notes-terms-left" style={{ flex: 1, pageBreakInside: "avoid" }}>
          <div className="special-notes-box">
            <h4>Special Notes</h4>
            <p>
              1. Please review all measurements carefully.<br/>
              2. Changes after production may incur extra charges.<br/>
              3. Delivery schedules may vary depending on material availability.
            </p>
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

        <div className="right-table" style={{ flex: 0.8, pageBreakInside: "avoid" }}>
          <table>
            <tbody>
              <tr>
                <td>WoodWork Value</td>
                <td>₹ {woodworkValue.toLocaleString()}</td>
              </tr>
              <tr>
                <td>Cartage</td>
                <td>As Per Actual</td>
              </tr>
              <tr>
                <td>Packing</td>
                <td>As Per Actual</td>
              </tr>
              <tr>
                <td>Installation</td>
                <td>As Per Actual</td>
              </tr>
              <tr>
                <td>Addon Value</td>
                <td>₹ {addonValue.toLocaleString()}</td>
              </tr>
              <tr>
                <td>Fittings Value</td>
                <td>₹ {fittingsValue.toLocaleString()}</td>
              </tr>
              <tr>
                <td><b>Gross Value</b></td>
                <td><b>₹ {grossValue.toLocaleString()}</b></td>
              </tr>
              <tr>
                <td><b>Total Project Value</b></td>
                <td><b>₹ {totalProjectValue.toLocaleString()}</b></td>
              </tr>
              <tr>
                <td colSpan="2"><b>In Words:</b> {amountInWords}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>

      {/* Signature */}
      <div className="signature-box">
        <h4>Authorized Signature</h4>
        <div className="signature-line">________________________</div>
      </div>
    </div>
  );
});

export default Page;
