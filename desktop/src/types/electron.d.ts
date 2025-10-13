// Electron API type definitions
declare global {
  interface Window {
    electronAPI: {
      // Navigation
      navigateTo: (route: string) => void
      onNavigate: (callback: (event: any, route: string) => void) => void
      
      // Data management
      exportData: (data: any) => void
      onExportData: (callback: (event: any, data: any) => void) => void
      
      // Chatbot
      onToggleChatbot: (callback: (event: any) => void) => void
      
      // Network status
      updateNetworkStatus: (isOnline: boolean) => void
      
      // Platform info
      platform: string
      
      // Version info
      versions: {
        node: string
        chrome: string
        electron: string
      }
    }
  }
}

export {}