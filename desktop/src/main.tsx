import React from 'react'
import { createRoot } from 'react-dom/client'
import { HashRouter } from 'react-router-dom'
import App from './App'
import './index.css'

// Add debugging for Electron
console.log('🚀 Starting KRTJ React App')
console.log('📍 Current location:', window.location.href)
console.log('🌐 Navigator online:', navigator.onLine)

createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <HashRouter>
      <App />
    </HashRouter>
  </React.StrictMode>
)

// Log when React has finished rendering
console.log('✅ React app rendering initiated')
