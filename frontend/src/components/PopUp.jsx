import React, { useEffect, useState, useRef } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { CheckCircle, AlertTriangle, XCircle, Info, X } from 'lucide-react';
import './PopUp.css';

/* ─────────────────────────────────────────────
   TYPE CONFIG
──────────────────────────────────────────── */
const CONFIG = {
  valid: {
    icon: CheckCircle,
    label: 'Success',
    className: 'popup--valid',
  },
  warning: {
    icon: AlertTriangle,
    label: 'Warning',
    className: 'popup--warning',
  },
  error: {
    icon: XCircle,
    label: 'Error',
    className: 'popup--error',
  },
  info: {
    icon: Info,
    label: 'Info',
    className: 'popup--info',
  },
};

/* ─────────────────────────────────────────────
   ANIMATION VARIANTS
   Enter  : slides in from the right (x: 110%)
   Visible: nudges left then snaps back (x: 0)
   Exit   : slides back out to the right
───────────────────────────────────────────── */
const popupVariants = {
  initial: { x: '110%', opacity: 0 },
  animate: {
    x: [null, '-18px', '0%'],   // slide-in → nudge left → settle
    opacity: 1,
    transition: {
      x: {
        times: [0, 0.6, 1],
        duration: 0.55,
        ease: 'easeOut',
      },
      opacity: { duration: 0.2 },
    },
  },
  exit: {
    x: '110%',
    opacity: 0,
    transition: { duration: 0.4, ease: 'easeIn' },
  },
};

/* ─────────────────────────────────────────────
   SINGLE POPUP
───────────────────────────────────────────── */
const PopUp = ({ id, type = 'valid', message, duration = 4000, onRemove }) => {
  const { icon: Icon, label, className } = CONFIG[type] || CONFIG.valid;
  const timerRef = useRef(null);

  // Auto-dismiss
  useEffect(() => {
    timerRef.current = setTimeout(() => onRemove(id), duration);
    return () => clearTimeout(timerRef.current);
  }, [id, duration, onRemove]);

  // Progress bar drains over "duration" ms
  const progressStyle = { animationDuration: `${duration}ms` };

  return (
    <motion.div
      layout
      variants={popupVariants}
      initial="initial"
      animate="animate"
      exit="exit"
      className={`popup ${className}`}
      role="alert"
      aria-live="assertive"
    >
      {/* Icon */}
      <span className="popup__icon">
        <Icon size={22} strokeWidth={2.2} />
      </span>

      {/* Body */}
      <div className="popup__body">
        <p className="popup__label">{label}</p>
        <p className="popup__message">{message}</p>
      </div>

      {/* Close button */}
      <button
        className="popup__close"
        onClick={() => onRemove(id)}
        aria-label="Dismiss notification"
      >
        <X size={16} />
      </button>

      {/* Progress bar */}
      <span className="popup__progress" style={progressStyle} />
    </motion.div>
  );
};

/* ─────────────────────────────────────────────
   POPUP CONTAINER  (renders the stack)
──────────────────────────────────────────── */
export const PopUpContainer = () => {
  const [popups, setPopups] = useState([]);

  useEffect(() => {
    const showPopup = (e) => {
      const { type, message, duration } = e.detail;
      const id = `popup-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
      setPopups((prev) => [...prev, { id, type, message, duration }]);
      setTimeout(() => {
        setPopups((prev) => prev.filter((t) => t.id !== id));
      }, duration || 4000);
    };
    window.addEventListener('show-popup', showPopup);
    return () => window.removeEventListener('show-popup', showPopup);
  }, []);

  return (
    <div className="popup-container" aria-label="Notifications">
      <AnimatePresence mode="popLayout">
        {popups.map((t) => (
          <PopUp key={t.id} {...t} onRemove={() => setPopups((prev) => prev.filter((p) => p.id !== t.id))} />
        ))}
      </AnimatePresence>
    </div>
  );
};

export default PopUp;
