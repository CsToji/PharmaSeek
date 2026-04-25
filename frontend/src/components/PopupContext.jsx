import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';

const PopupContext = createContext(null);

let globalPopupFn = null;

export const showPopup = (type, message, duration) => {
  if (globalPopupFn) {
    globalPopupFn(type, message, duration);
  } else {
    window.dispatchEvent(new CustomEvent('show-popup', { detail: { type, message, duration } }));
  }
};

export const PopupProvider = ({ children }) => {
  const [popups, setPopups] = useState([]);

  const remove = useCallback((id) => {
    setPopups((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const addPopUp = useCallback(({ type = 'valid', message, duration = 4000 }) => {
    const id = `popup-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
    setPopups((prev) => [...prev, { id, type, message, duration }]);
    return id;
  }, []);

  globalPopupFn = addPopUp;

  useEffect(() => {
    const handler = (e) => {
      const { type, message, duration } = e.detail;
      addPopUp({ type, message, duration });
    };
    window.addEventListener('show-popup', handler);
    return () => window.removeEventListener('show-popup', handler);
  }, [addPopUp]);

  const popup = {
    valid: (message, duration) => addPopUp({ type: 'valid', message, duration }),
    warning: (message, duration) => addPopUp({ type: 'warning', message, duration }),
    error: (message, duration) => addPopUp({ type: 'error', message, duration }),
    info: (message, duration) => addPopUp({ type: 'info', message, duration }),
  };

  return (
    <PopupContext.Provider value={{ popups, popup, remove }}>
      {children}
    </PopupContext.Provider>
  );
};

export const useGlobalPopup = () => {
  const context = useContext(PopupContext);
  if (!context) {
    return { popup: showPopup, popups: [], remove: () => {} };
  }
  return context;
};

export default useGlobalPopup;