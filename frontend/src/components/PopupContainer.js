import React from "react";
import PopupMessage from "./PopupMessage";

const PopupContainer = ({ popups, onClose }) => {
  return (
    <div className="popup-container">
      {popups.map((popup) => (
        <PopupMessage
          key={popup.id}
          message={popup.message}
          type={popup.type}
          duration={popup.duration}
          onClose={() => onClose(popup.id)}
        />
      ))}
    </div>
  );
};

export default PopupContainer;
