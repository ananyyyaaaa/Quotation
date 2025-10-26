import { useState, useCallback } from "react";

export const usePopupManager = () => {
  const [popups, setPopups] = useState([]);

  const showPopup = useCallback((message, type = "info", duration = 3000) => {
    const id = Date.now() + Math.random();
    const newPopup = { id, message, type, duration };
    
    setPopups(prev => [...prev, newPopup]);
    
    return id;
  }, []);

  const hidePopup = useCallback((id) => {
    setPopups(prev => prev.filter(popup => popup.id !== id));
  }, []);

  const showSuccess = useCallback((message, duration = 3000) => {
    return showPopup(message, "success", duration);
  }, [showPopup]);

  const showError = useCallback((message, duration = 4000) => {
    return showPopup(message, "error", duration);
  }, [showPopup]);

  const showWarning = useCallback((message, duration = 3500) => {
    return showPopup(message, "warning", duration);
  }, [showPopup]);

  const showInfo = useCallback((message, duration = 3000) => {
    return showPopup(message, "info", duration);
  }, [showPopup]);

  return {
    popups,
    showPopup,
    hidePopup,
    showSuccess,
    showError,
    showWarning,
    showInfo
  };
};
