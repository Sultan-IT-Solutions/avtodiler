import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.tsx'
import './index.css'
import './i18n/config.ts'

if (typeof window !== 'undefined') {
  const block = (e: Event) => {
    if (typeof e.preventDefault === 'function') e.preventDefault()
  }
  window.addEventListener('gesturestart', block, { passive: false } as AddEventListenerOptions)
  window.addEventListener('gesturechange', block, { passive: false } as AddEventListenerOptions)
  window.addEventListener('gestureend', block, { passive: false } as AddEventListenerOptions)
}

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)
