import React from "react";
import "./Header.css";
import logo from "../pages/logo.png";

const Header = () => {
  return (
    <header className="app-header">
      <div className="header-content">
        <div className="header-left">
          <img src={logo} alt="Company Logo" className="header-logo" />
          <div className="header-brand">
            <h1 className="company-name">Inovik Modular Kitchen</h1>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;

