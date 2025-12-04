import React from "react";
import "./Help.css";

const Help = () => {
  return (
    <div className="help-page">
      {/* Header */}
      <div className="help-header">
        <div className="header-content">
          <div className="header-left">
            <h1>Help & Support</h1>
            <p>Get assistance and find answers to your questions</p>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="help-content">
        <div className="help-cards">
          <div className="help-card">
            <div className="card-icon">📧</div>
            <h3>Contact Support</h3>
            <p>Need help? Reach out to our support team</p>
            <div className="contact-email">
              <a href="mailto:support@inoviksolutions.com" className="email-link">
                info.mananresources@gmail.com
              </a><br /><br />
              <a href="" className="email-link">
                +91-8146428915 
              </a>
            </div>
          </div>

          {/* <div className="help-card">
            <div className="card-icon">📚</div>
            <h3>Documentation</h3>
            <p>Learn how to use the application effectively</p>
            <div className="help-links">
              <a href="#" className="help-link">User Guide</a>
              <a href="#" className="help-link">FAQ</a>
              <a href="#" className="help-link">Video Tutorials</a>
            </div>
          </div> */}

          {/* <div className="help-card">
            <div className="card-icon">🆘</div>
            <h3>Quick Help</h3>
            <p>Common issues and solutions</p>
            <div className="help-links">
              <a href="#" className="help-link">Troubleshooting</a>
              <a href="#" className="help-link">System Requirements</a>
              <a href="#" className="help-link">Browser Compatibility</a>
            </div>
          </div> */}
        </div>

        {/* <div className="help-footer">
          <div className="footer-content">
            <h3>Still need help?</h3>
            <p>Don't hesitate to reach out to us at:</p>
            <div className="contact-email">
              <a href="mailto:support@inoviksolutions.com" className="email-link">
                📧 support@inoviksolutions.com
              </a>
            </div>
          </div>
        </div> */}
      </div>
    </div>
  );
};

export default Help;
