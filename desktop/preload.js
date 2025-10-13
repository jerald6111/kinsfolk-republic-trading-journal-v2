const { contextBridge, ipcRenderer } = require('electron')

// Expose protected methods that allow the renderer process to use
// the ipcRenderer without exposing the entire object
contextBridge.exposeInMainWorld('electronAPI', {
  // Navigation
  navigateTo: (route) => ipcRenderer.send('app-navigate', route),
  
  // Data management
  exportData: (data) => ipcRenderer.send('export-data-ready', data),
  
  // Network status
  updateNetworkStatus: (isOnline) => ipcRenderer.send('network-status', isOnline),
  
  // Listen for navigation requests from main process
  onNavigate: (callback) => ipcRenderer.on('navigate-to', callback),
  onExportData: (callback) => ipcRenderer.on('export-data', callback),
  onToggleChatbot: (callback) => ipcRenderer.on('toggle-chatbot', callback),
  
  // Platform info
  platform: process.platform,
  
  // Version info
  versions: {
    node: process.versions.node,
    chrome: process.versions.chrome,
    electron: process.versions.electron
  }
})

// Add online/offline detection
window.addEventListener('DOMContentLoaded', () => {
  function updateOnlineStatus() {
    const isOnline = navigator.onLine
    if (window.electronAPI) {
      window.electronAPI.updateNetworkStatus(isOnline)
    }
  }

  window.addEventListener('online', updateOnlineStatus)
  window.addEventListener('offline', updateOnlineStatus)
  
  // Initial status
  updateOnlineStatus()

  // Listen for navigation events from main process
  if (window.electronAPI) {
    window.electronAPI.onNavigate((_event, route) => {
      console.log('Navigation requested to:', route)
      // Handle navigation in React Router
      if (window.history && window.history.pushState) {
        window.history.pushState({}, '', route)
        // Dispatch a custom event to notify React Router
        window.dispatchEvent(new PopStateEvent('popstate'))
      }
    })

    window.electronAPI.onToggleChatbot((_event) => {
      console.log('Toggle chatbot requested')
      // Dispatch custom event for chatbot toggle
      window.dispatchEvent(new CustomEvent('toggle-chatbot'))
    })

    window.electronAPI.onExportData((_event, filePath) => {
      console.log('Export data requested to:', filePath)
      // Dispatch custom event for data export
      window.dispatchEvent(new CustomEvent('export-data', { detail: { filePath } }))
    })
  }

  console.log('🚀 KRTJ Desktop preload completed')
})