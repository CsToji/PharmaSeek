import { useState, useCallback } from 'react';

const usePopUp = () => {
  const [popups, setPopUps] = useState([]);

  const remove = useCallback((id) => {
    setPopUps((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const addPopUp = useCallback(({ type = 'valid', message, duration = 4000 }) => {
    const id = `popup-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
    setPopUps((prev) => [...prev, { id, type, message, duration }]);
    return id;
  }, []);

  const popup = {
    valid: (message, duration) => addPopUp({ type: 'valid', message, duration }),
    warning: (message, duration) => addPopUp({ type: 'warning', message, duration }),
    error: (message, duration) => addPopUp({ type: 'error', message, duration }),
    info: (message, duration) => addPopUp({ type: 'info', message, duration }),
  };

  return { popups, popup, addPopUp, remove };
};

export default usePopUp;