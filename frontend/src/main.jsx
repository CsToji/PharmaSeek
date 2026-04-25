import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'

window.alert = (msg) => {
  const isError = msg.toLowerCase().includes('fail') || msg.toLowerCase().includes('error');
  window.dispatchEvent(new CustomEvent('show-popup', { 
    detail: { type: isError ? 'error' : 'info', message: msg, duration: 4000 } 
  }));
};

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
