import React, { useEffect } from "react";
import "./PopupMessage.css";

const PopupMessage = ({ message, type = "info", duration = 3000, onClose }) => {
  useEffect(() => {
    if (duration > 0) {
      const timer = setTimeout(() => {
        onClose();
      }, duration);
      return () => clearTimeout(timer);
    }
  }, [duration, onClose]);

  return (
    <div className={`popup-message popup-${type}`}>
      <div className="popup-content">
        <span className="popup-text">{message}</span>
        <button className="popup-close" onClick={onClose}>×</button>
      </div>
    </div>
  );
};

export default PopupMessage;
