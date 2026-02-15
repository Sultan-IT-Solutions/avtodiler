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

  document.addEventListener(
    'touchstart',
    (e) => {
      if ((e as TouchEvent).touches && (e as TouchEvent).touches.length > 1) e.preventDefault()
    },
    { passive: false }
  )

  document.addEventListener(
    'touchmove',
    (e) => {
      if ((e as TouchEvent).touches && (e as TouchEvent).touches.length > 1) e.preventDefault()
    },
    { passive: false }
  )

  let lastTouchEnd = 0
  document.addEventListener(
    'touchend',
    (e) => {
      const now = Date.now()
      if (now - lastTouchEnd <= 300) {
        e.preventDefault()
      }
      lastTouchEnd = now
    },
    { passive: false }
  )

  window.addEventListener(
    'wheel',
    (e) => {
      if ((e as any).ctrlKey || (e as any).metaKey) e.preventDefault()
    },
    { passive: false }
  )
}

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)
