const { app, BrowserWindow, Menu, Tray, shell, ipcMain, dialog, nativeImage, nativeTheme } = require('electron')
const { autoUpdater } = require('electron-updater')
const path = require('path')
const fs = require('fs')

// Better development detection
const isDev = process.env.NODE_ENV === 'development' || !app.isPackaged

// Force dark mode globally for Windows
if (process.platform === 'win32') {
  nativeTheme.themeSource = 'dark'
}

console.log('🚀 Starting KRTJ Desktop App...')
console.log('📂 App path:', app.getAppPath())
console.log('🔧 Development mode:', isDev)
console.log('📦 Is packaged:', app.isPackaged)
console.log('🎨 Dark mode enabled:', nativeTheme.shouldUseDarkColors)

class KRTJDesktopApp {
  constructor() {
    this.mainWindow = null
    this.tray = null
    this.isQuiting = false
    this.setupAutoUpdater()
  }

  setupAutoUpdater() {
    // Configure custom update system
    console.log('🔧 Setting up custom update system...')
    // Using correct domain URL
    this.updateCheckUrl = 'https://kinsfolk-republic-trading-journal-v.vercel.app/downloads/version.json'
    this.currentVersion = require('./package.json').version
  }

  async checkForUpdates(showNoUpdateMessage = false) {
    if (isDev && showNoUpdateMessage) {
      dialog.showMessageBox(this.mainWindow, {
        type: 'info',
        title: 'Development Mode',
        message: 'Update checking is disabled in development mode.',
        buttons: ['OK']
      })
      return
    }

    try {
      console.log('🔍 Checking for updates...')
      console.log('📡 Update URL:', this.updateCheckUrl)
      const https = require('https')
      
      const updateData = await new Promise((resolve, reject) => {
        https.get(this.updateCheckUrl, (res) => {
          console.log('📊 Response status:', res.statusCode)
          console.log('📋 Response headers:', res.headers)
          
          if (res.statusCode !== 200) {
            reject(new Error(`HTTP ${res.statusCode}: ${res.statusMessage}`))
            return
          }
          
          let data = ''
          res.on('data', (chunk) => data += chunk)
          res.on('end', () => {
            console.log('📦 Raw response data:', data.substring(0, 200) + '...')
            try {
              const parsed = JSON.parse(data)
              console.log('✅ Successfully parsed JSON')
              resolve(parsed)
            } catch (e) {
              console.error('❌ JSON Parse Error:', e.message)
              console.error('📄 Raw data length:', data.length)
              reject(new Error(`Invalid JSON response: ${e.message}`))
            }
          })
        }).on('error', (err) => {
          console.error('🌐 Network Error:', err.message)
          reject(err)
        })
      })

      const latestVersion = updateData.version
      const currentVersion = this.currentVersion

      console.log(`📊 Current: ${currentVersion}, Latest: ${latestVersion}`)

      if (this.isNewerVersion(latestVersion, currentVersion)) {
        console.log('✨ Update available!')
        
        // Show system notification if available
        this.showUpdateNotification(updateData)
        
        // Also show the detailed dialog
        await this.showUpdateAvailableDialog(updateData)
      } else {
        console.log('✅ App is up to date')
        if (showNoUpdateMessage) {
          dialog.showMessageBox(this.mainWindow, {
            type: 'info',
            title: '✅ You\'re Up to Date!',
            message: 'You have the latest version of KRTJ Desktop.',
            detail: `Current version: ${currentVersion}`,
            buttons: ['OK']
          })
        }
      }
    } catch (error) {
      console.error('❌ Update check failed:', error)
      
      // Try alternative method using electron's net module (bypasses CORS)
      try {
        console.log('🔄 Trying alternative update check method...')
        const { net } = require('electron')
        const request = net.request(this.updateCheckUrl)
        
        request.on('response', (response) => {
          console.log(`🔄 Alternative response status: ${response.statusCode}`)
          let data = ''
          response.on('data', (chunk) => {
            data += chunk
          })
          response.on('end', () => {
            try {
              const updateData = JSON.parse(data)
              console.log('✅ Alternative method success:', updateData)
              if (this.isNewerVersion(updateData.version, this.currentVersion)) {
                this.showUpdateAvailableDialog(updateData)
              }
            } catch (parseError) {
              console.error('❌ Alternative method JSON error:', parseError)
              this.showUpdateCheckError(error, showNoUpdateMessage)
            }
          })
        })
        
        request.on('error', (err) => {
          console.error('❌ Alternative method failed:', err)
          this.showUpdateCheckError(error, showNoUpdateMessage)
        })
        
        request.end()
        
      } catch (altError) {
        console.error('❌ Alternative method not available:', altError)
        this.showUpdateCheckError(error, showNoUpdateMessage)
      }
    }
  }

  showUpdateCheckError(error, showMessage) {
    if (showMessage) {
      dialog.showMessageBox(this.mainWindow, {
        type: 'error',
        title: '❌ Update Check Failed',
        message: 'Could not check for updates. Please try again later.',
        detail: `Error: ${error.message}\n\nTip: Check your internet connection or try again in a few minutes.`,
        buttons: ['OK']
      })
    }
  }

  isNewerVersion(latest, current) {
    const latestParts = latest.split('.').map(Number)
    const currentParts = current.split('.').map(Number)
    
    for (let i = 0; i < Math.max(latestParts.length, currentParts.length); i++) {
      const latestPart = latestParts[i] || 0
      const currentPart = currentParts[i] || 0
      
      if (latestPart > currentPart) return true
      if (latestPart < currentPart) return false
    }
    return false
  }

  async showUpdateAvailableDialog(updateData) {
    if (!this.mainWindow) return

    const releaseNotes = updateData.releaseNotes
    let detailText = `🎉 ${releaseNotes.title}\n\n`
    
    if (releaseNotes.features && releaseNotes.features.length > 0) {
      detailText += '✨ New Features:\n'
      releaseNotes.features.forEach(feature => detailText += `• ${feature}\n`)
      detailText += '\n'
    }
    
    if (releaseNotes.improvements && releaseNotes.improvements.length > 0) {
      detailText += '🔧 Improvements:\n'
      releaseNotes.improvements.forEach(improvement => detailText += `• ${improvement}\n`)
      detailText += '\n'
    }
    
    if (releaseNotes.bugFixes && releaseNotes.bugFixes.length > 0) {
      detailText += '🐛 Bug Fixes:\n'
      releaseNotes.bugFixes.forEach(fix => detailText += `• ${fix}\n`)
      detailText += '\n'
    }

    if (releaseNotes.notes) {
      detailText += `📝 ${releaseNotes.notes}\n\n`
    }

    detailText += `📦 Download size: ${updateData.fileSize || 'Unknown'}\n`
    detailText += `📅 Released: ${updateData.releaseDate}`

    const response = await dialog.showMessageBox(this.mainWindow, {
      type: 'info',
      title: '🚀 KRTJ Update Available',
      message: `Version ${updateData.version} is now available!`,
      detail: detailText + '\n\n💡 Tip: Use "Download from Website" for the most reliable download experience.',
      buttons: ['Download from Website', 'Try Auto Download', 'View Details', 'Remind Me Later'],
      defaultId: 0,
      cancelId: 3,
      noLink: true
    })

    if (response.response === 0) {
      // Open download page in browser (most reliable)
      const { shell } = require('electron')
      shell.openExternal('https://kinsfolk-republic-trading-journal-v.vercel.app/download')
    } else if (response.response === 1) {
      // Try auto download and install
      this.downloadAndInstallUpdate(updateData)
    } else if (response.response === 2) {
      // Show detailed changelog in a larger dialog
      this.showDetailedChangelog(updateData)
    }
  }

  async showDetailedChangelog(updateData) {
    const releaseNotes = updateData.releaseNotes
    
    // Create a detailed changelog window
    let changelog = `KRTJ Desktop ${updateData.version}\n`
    changelog += `Release Date: ${updateData.releaseDate}\n`
    changelog += `${'='.repeat(50)}\n\n`
    
    if (releaseNotes.features && releaseNotes.features.length > 0) {
      changelog += '🌟 NEW FEATURES:\n'
      releaseNotes.features.forEach((feature, index) => {
        changelog += `  ${index + 1}. ${feature}\n`
      })
      changelog += '\n'
    }
    
    if (releaseNotes.improvements && releaseNotes.improvements.length > 0) {
      changelog += '🔧 IMPROVEMENTS:\n'
      releaseNotes.improvements.forEach((improvement, index) => {
        changelog += `  ${index + 1}. ${improvement}\n`
      })
      changelog += '\n'
    }
    
    if (releaseNotes.bugFixes && releaseNotes.bugFixes.length > 0) {
      changelog += '🐛 BUG FIXES:\n'
      releaseNotes.bugFixes.forEach((fix, index) => {
        changelog += `  ${index + 1}. ${fix}\n`
      })
      changelog += '\n'
    }

    if (releaseNotes.notes) {
      changelog += `📋 RELEASE NOTES:\n${releaseNotes.notes}\n\n`
    }

    changelog += `💾 Download Size: ${updateData.fileSize || 'Unknown'}\n`
    changelog += `🔗 Direct Download: Available from KRTJ website\n`

    const response = await dialog.showMessageBox(this.mainWindow, {
      type: 'info',
      title: `📋 KRTJ ${updateData.version} - Full Changelog`,
      message: changelog,
      buttons: ['Download Now', 'Copy Changelog', 'Close'],
      defaultId: 0,
      cancelId: 2
    })

    if (response.response === 0) {
      this.downloadAndInstallUpdate(updateData)
    } else if (response.response === 1) {
      // Copy changelog to clipboard
      const { clipboard } = require('electron')
      clipboard.writeText(changelog)
      dialog.showMessageBox(this.mainWindow, {
        type: 'info',
        title: '📋 Copied!',
        message: 'Changelog copied to clipboard.',
        buttons: ['OK']
      })
    }
  }

  showUpdateNotification(updateData) {
    // Create system tray notification
    if (this.tray) {
      this.tray.displayBalloon({
        title: '🚀 KRTJ Update Available!',
        content: `Version ${updateData.version} is ready to download with new features and improvements!`,
        iconType: 'info'
      })

      // Add temporary tray menu item for quick access to update
      const currentMenu = this.tray.getContextMenu()
      const menuItems = currentMenu.items.slice() // Copy existing items
      
      // Insert update item at the top
      menuItems.unshift(
        {
          label: `🔥 Update to v${updateData.version} Available!`,
          click: () => {
            this.showUpdateAvailableDialog(updateData)
          }
        },
        { type: 'separator' }
      )

      const newMenu = Menu.buildFromTemplate(menuItems)
      this.tray.setContextMenu(newMenu)

      // Remove the update notification from tray menu after 24 hours
      setTimeout(() => {
        this.resetTrayMenu()
      }, 24 * 60 * 60 * 1000)
    }
  }

  resetTrayMenu() {
    // Reset to original tray menu (remove update notification)
    this.createTray()
  }

  async downloadAndInstallUpdate(updateData) {
    try {
      // Show progress dialog
      const progressOptions = {
        type: 'info',
        title: '⬇️ Downloading Update',
        message: `Downloading KRTJ Desktop v${updateData.version}...`,
        detail: 'Please wait while we download and prepare the update for installation.',
        buttons: ['Cancel Download']
      }

      // For now, we'll implement a hybrid approach:
      // 1. Download the installer automatically
      // 2. Run it with silent installation parameters
      
      const fs = require('fs')
      const https = require('https')
      const path = require('path')
      const { spawn } = require('child_process')
      
      // Create temp directory for download
      const tempDir = path.join(require('os').tmpdir(), 'krtj-update')
      const installerPath = path.join(tempDir, 'KRTJ-Desktop-Setup.exe')
      
      // Ensure temp directory exists
      if (!fs.existsSync(tempDir)) {
        fs.mkdirSync(tempDir, { recursive: true })
      }

      // Show downloading dialog
      const progressDialog = dialog.showMessageBox(this.mainWindow, {
        type: 'info',
        title: '⬇️ Downloading Update',
        message: `Downloading KRTJ Desktop v${updateData.version}...`,
        detail: 'This will take a few moments. The app will restart automatically after installation.',
        buttons: ['Download in Background']
      })

      // Download the installer - use the URL from updateData or construct full URL
      const baseUrl = 'https://kinsfolk-republic-trading-journal-v.vercel.app'
      const downloadUrl = updateData.downloadUrl.startsWith('http') 
        ? updateData.downloadUrl 
        : baseUrl + updateData.downloadUrl
      
      await new Promise((resolve, reject) => {
        const file = fs.createWriteStream(installerPath)
        
        https.get(downloadUrl, (response) => {
          if (response.statusCode !== 200) {
            reject(new Error(`Download failed: HTTP ${response.statusCode} - Installer file not found on server`))
            return
          }
          
          // Check if we're getting HTML instead of executable
          const contentType = response.headers['content-type'] || ''
          if (contentType.includes('text/html')) {
            reject(new Error('Server returned HTML page instead of installer file - Installer not uploaded to hosting'))
            return
          }
          
          // Check if response looks like an HTML page by checking first few bytes
          let firstChunk = true
          response.on('data', (chunk) => {
            if (firstChunk) {
              const chunkStr = chunk.toString().toLowerCase()
              if (chunkStr.includes('<!doctype') || chunkStr.includes('<html')) {
                reject(new Error('Received HTML page instead of installer - File not found on server'))
                return
              }
              firstChunk = false
            }
          })
          
          const totalSize = parseInt(response.headers['content-length'], 10)
          let downloadedSize = 0
          
          response.on('data', (chunk) => {
            downloadedSize += chunk.length
            const progress = ((downloadedSize / totalSize) * 100).toFixed(1)
            console.log(`📥 Download progress: ${progress}%`)
          })
          
          response.pipe(file)
        }).on('error', (err) => {
          reject(err)
        })
        
        file.on('finish', () => {
          file.close()
          resolve()
        })
        
        file.on('error', (err) => {
          fs.unlink(installerPath, () => {}) // Delete partial file
          reject(err)
        })
      })

      console.log('✅ Download completed:', installerPath)
      
      // Show installation confirmation
      const installResponse = await dialog.showMessageBox(this.mainWindow, {
        type: 'question',
        title: '🚀 Ready to Install',
        message: `Update downloaded successfully!`,
        detail: `KRTJ Desktop v${updateData.version} is ready to install. The app will close and restart with the new version.\n\nYour data and settings will be preserved.`,
        buttons: ['Install Now', 'Install Later'],
        defaultId: 0,
        cancelId: 1
      })

      if (installResponse.response === 0) {
        // Run the installer with parameters to restart the app
        console.log('🔄 Starting installation...')
        
        // Get the current app executable path
        const currentAppPath = process.execPath
        
        // Show installing notification
        new Notification({
          title: '🔄 Installing Update',
          body: `Installing KRTJ Desktop v${updateData.version}... The app will restart automatically.`,
          icon: path.join(__dirname, 'public', 'krtj-icon.ico')
        }).show()
        
        // Simple approach: run installer then use app.relaunch
        const installer = spawn(installerPath, ['/S'], {
          detached: true,
          stdio: 'ignore'
        })
        
        installer.unref()
        
        // Wait a bit for installer to start, then quit and let the installer handle restart
        setTimeout(() => {
          // Save a restart flag for when the new app starts
          const restartFlag = path.join(require('os').homedir(), '.krtj-restart-required')
          fs.writeFileSync(restartFlag, Date.now().toString())
          
          // Quit the current app so installer can complete
          app.quit()
        }, 3000)
        
        // Show system notification that app is restarting
        new Notification({
          title: '✅ Update Installing',
          body: 'KRTJ will restart automatically after installation completes.',
          icon: path.join(__dirname, 'public', 'krtj-icon.ico')
        }).show()
        
        // Close the app after a short delay
        setTimeout(() => {
          app.quit()
        }, 1500)
      } else {
        dialog.showMessageBox(this.mainWindow, {
          type: 'info',
          title: '⏳ Update Saved',
          message: 'Update installer saved for later.',
          detail: `You can install the update anytime by running: ${installerPath}`,
          buttons: ['OK']
        })
      }
      
    } catch (error) {
      console.error('❌ Auto-update failed:', error)
      
      // Fallback to manual download
      dialog.showMessageBox(this.mainWindow, {
        type: 'warning',
        title: '⚠️ Auto-Download Not Available',
        message: 'The installer file is not yet available for automatic download.',
        detail: `${error.message}\n\nThis usually means:\n• The installer is still being uploaded to the server\n• The website deployment is in progress\n\nYou can download manually from the website instead.`,
        buttons: ['Open Download Page', 'Try Again Later']
      }).then((response) => {
        if (response.response === 0) {
          shell.openExternal('https://kinsfolk-republic-trading-journal-v.vercel.app/download')
        }
      })
    }
  }

  createWindow() {
    // Force dark mode before creating window
    if (process.platform === 'win32') {
      app.setAppUserModelId('KinsfolkRepublic.TradingJournal')
      // Force Windows dark mode
      try {
        const { nativeTheme } = require('electron')
        nativeTheme.themeSource = 'dark'
      } catch (err) {
        console.log('Could not set native theme:', err)
      }
    }

    // Create the browser window with dark theme
    this.mainWindow = new BrowserWindow({
      width: 1400,
      height: 900,
      minWidth: 1200,
      minHeight: 700,
      icon: path.join(__dirname, 'public/krtj-icon.ico'),
      webPreferences: {
        nodeIntegration: false,
        contextIsolation: true,
        enableRemoteModule: false,
        webSecurity: false, // Allow external content for TradingView widgets
        allowRunningInsecureContent: true, // Allow mixed content
        preload: path.join(__dirname, 'preload.js')
      },
      show: false, // Don't show until ready
      titleBarStyle: process.platform === 'darwin' ? 'hiddenInset' : 'default',
      title: `Kinsfolk Republic Trading Journal v${this.currentVersion}`,
      autoHideMenuBar: true, // Hide the redundant menu bar
      menuBarVisible: false,  // Ensure menu bar is hidden
      backgroundColor: '#0F1114', // Darker background for better dark theme
      darkTheme: true,        // Enable dark theme for Windows
      frame: true,            // Keep native frame but with dark theme
      thickFrame: false,      // Use regular frame for better compatibility
      titleBarOverlay: process.platform === 'win32' ? {
        color: '#181A20',
        symbolColor: '#F4D03F',
        height: 32
      } : undefined
    })

    // Load the app
    if (isDev) {
      this.mainWindow.loadURL('http://localhost:5173')
      this.mainWindow.webContents.openDevTools()
    } else {
      // For production, load from dist folder
      const indexPath = path.join(__dirname, 'dist', 'index.html')
      console.log('Loading index.html from:', indexPath)
      this.mainWindow.loadFile(indexPath).catch(err => {
        console.error('Failed to load index.html:', err)
        // Fallback: try to load a simple HTML page
        this.mainWindow.loadURL('data:text/html;charset=utf-8,' + encodeURIComponent(`
          <html>
            <head><title>KRTJ Loading...</title></head>
            <body style="font-family: Arial; padding: 20px; text-align: center;">
              <h1>KRTJ Desktop App</h1>
              <p>Loading application... Please wait.</p>
              <p>If this persists, try running in development mode.</p>
            </body>
          </html>
        `))
      })
    }

    // Show window when ready
    this.mainWindow.once('ready-to-show', () => {
      this.mainWindow.show()
      
      // Apply Windows 10/11 dark theme to title bar
      if (process.platform === 'win32') {
        try {
          // Try to set dark theme for title bar (Windows 10/11)
          const { systemPreferences } = require('electron')
          if (systemPreferences.isDarkMode && systemPreferences.isDarkMode()) {
            // Window is already configured for dark theme
          }
        } catch (error) {
          console.log('Could not apply dark title bar theme:', error.message)
        }
      }
      
      // Focus on the window
      if (isDev) {
        this.mainWindow.focus()
        this.mainWindow.webContents.openDevTools()
      }
      
      // Check if app was restarted after update
      const restartFlag = path.join(require('os').homedir(), '.krtj-restart-required')
      if (fs.existsSync(restartFlag)) {
        console.log('✅ App restarted after update')
        // Remove the flag
        fs.unlinkSync(restartFlag)
        
        // Show success notification
        setTimeout(() => {
          new Notification({
            title: '✅ Update Complete!',
            body: `KRTJ Desktop has been successfully updated to v${this.currentVersion}. All features are now available.`,
            icon: path.join(__dirname, 'public', 'krtj-icon.ico')
          }).show()
        }, 2000)
      }
      
      // Check for updates after app loads (delay to not interrupt startup)
      setTimeout(() => {
        this.checkForUpdates(false) // Silent check on startup
      }, 5000) // Wait 5 seconds after app loads
      
      // Set up periodic update checks (every 4 hours)
      setInterval(() => {
        console.log('🔄 Periodic update check...')
        this.checkForUpdates(false) // Silent periodic check
      }, 4 * 60 * 60 * 1000) // 4 hours
    })

    // Debug web contents
    this.mainWindow.webContents.on('did-finish-load', () => {
      console.log('✅ Web contents finished loading')
    })

    this.mainWindow.webContents.on('did-fail-load', (event, errorCode, errorDescription) => {
      console.error('❌ Failed to load:', errorCode, errorDescription)
    })

    // Handle window closed
    this.mainWindow.on('closed', () => {
      this.mainWindow = null
    })

    // Handle minimize to tray
    this.mainWindow.on('minimize', (event) => {
      if (this.tray) {
        event.preventDefault()
        this.mainWindow.hide()
      }
    })

    // Handle window close (minimize to tray instead)
    this.mainWindow.on('close', (event) => {
      if (!this.isQuiting && this.tray) {
        event.preventDefault()
        this.mainWindow.hide()
        
        // Show notification
        if (process.platform === 'win32') {
          this.tray.displayBalloon({
            iconType: 'info',
            title: 'KRTJ Desktop',
            content: 'Application was minimized to tray'
          })
        }
        return false
      }
    })

    // Handle external links
    this.mainWindow.webContents.setWindowOpenHandler(({ url }) => {
      shell.openExternal(url)
      return { action: 'deny' }
    })
  }

  createTray() {
    // Create tray icon using our KRTJ logo
    const trayIconPath = path.join(__dirname, 'public/krtj-icon.ico')
    let trayIcon = nativeImage.createFromPath(trayIconPath)
    
    // Resize for system tray
    trayIcon = trayIcon.resize({ width: 16, height: 16 })
    this.tray = new Tray(trayIcon)
    
    // Tray context menu
    const contextMenu = Menu.buildFromTemplate([
      {
        label: 'Show KRTJ',
        click: () => {
          this.mainWindow.show()
          this.mainWindow.focus()
        }
      },
      {
        label: 'New Trade Entry',
        click: () => {
          this.mainWindow.show()
          this.mainWindow.focus()
          // Navigate to Journal Entries page
          this.mainWindow.webContents.send('navigate-to', '/journal/entries')
        }
      },
      { type: 'separator' },
      {
        label: 'Check Prices',
        click: () => {
          this.mainWindow.show()
          this.mainWindow.focus()
          // Navigate to Data Market page
          this.mainWindow.webContents.send('navigate-to', '/data-market')
        }
      },
      {
        label: 'Vision Board',
        click: () => {
          this.mainWindow.show()
          this.mainWindow.focus()
          this.mainWindow.webContents.send('navigate-to', '/vision')
        }
      },
      { type: 'separator' },
      {
        label: 'Check for Updates',
        click: () => {
          this.checkForUpdates(true) // Show "no updates" message if up to date
        }
      },
      {
        label: 'About KRTJ',
        click: () => {
          const version = require('./package.json').version
          dialog.showMessageBox(this.mainWindow, {
            type: 'info',
            title: 'About KRTJ Desktop',
            message: 'Kinsfolk Republic Trading Journal',
            detail: `Desktop version v${version}\nA comprehensive trading journal for crypto, stocks & forex.\n\nFeatures:\n• Offline-capable trading journal\n• Live market data (online)\n• AI trading assistant (online)\n• Complete privacy - no accounts needed\n• Rich update notifications with changelogs\n• System tray integration\n• Automatic updates available`
          })
        }
      },
      {
        label: 'Quit KRTJ',
        click: () => {
          this.isQuiting = true
          app.quit()
        }
      }
    ])
    
    this.tray.setContextMenu(contextMenu)
    this.tray.setToolTip('Kinsfolk Republic Trading Journal')
    
    // Double click to show window
    this.tray.on('double-click', () => {
      this.mainWindow.show()
      this.mainWindow.focus()
    })
  }

  createMenu() {
    const template = [
      {
        label: 'File',
        submenu: [
          {
            label: 'New Trade',
            accelerator: 'CmdOrCtrl+N',
            click: () => {
              this.mainWindow.webContents.send('navigate-to', '#/journal')
            }
          },
          { type: 'separator' },
          {
            label: 'Export Data',
            click: async () => {
              const result = await dialog.showSaveDialog(this.mainWindow, {
                defaultPath: 'krtj-trades-export.json',
                filters: [
                  { name: 'JSON Files', extensions: ['json'] },
                  { name: 'All Files', extensions: ['*'] }
                ]
              })
              
              if (!result.canceled) {
                // Send IPC to export data
                this.mainWindow.webContents.send('export-data', result.filePath)
              }
            }
          },
          { type: 'separator' },
          { role: 'quit' }
        ]
      },
      {
        label: 'Trading',
        submenu: [
          {
            label: 'Vision Board',
            accelerator: 'CmdOrCtrl+V',
            click: () => {
              this.mainWindow.webContents.send('navigate-to', '#/vision')
            }
          },
          {
            label: 'Journal',
            accelerator: 'CmdOrCtrl+J',
            click: () => {
              this.mainWindow.webContents.send('navigate-to', '#/journal')
            }
          },
          {
            label: 'Vision Board',
            accelerator: 'CmdOrCtrl+V',
            click: () => {
              this.mainWindow.webContents.send('navigate-to', '#/vision')
            }
          },
          {
            label: 'Strategies',
            accelerator: 'CmdOrCtrl+S',
            click: () => {
              this.mainWindow.webContents.send('navigate-to', '#/playbook')
            }
          }
        ]
      },
      {
        label: 'Market',
        submenu: [
          {
            label: 'Live News & Data',
            accelerator: 'CmdOrCtrl+M',
            click: () => {
              this.mainWindow.webContents.send('navigate-to', '#/news')
            }
          },
          {
            label: 'AI Trading Assistant',
            accelerator: 'CmdOrCtrl+A',
            click: () => {
              // Toggle chatbot
              this.mainWindow.webContents.send('toggle-chatbot')
            }
          }
        ]
      },
      {
        label: 'View',
        submenu: [
          { role: 'reload' },
          { role: 'forceReload' },
          { role: 'toggleDevTools' },
          { type: 'separator' },
          { role: 'resetZoom' },
          { role: 'zoomIn' },
          { role: 'zoomOut' },
          { type: 'separator' },
          { role: 'togglefullscreen' }
        ]
      },
      {
        label: 'Window',
        submenu: [
          { role: 'minimize' },
          { role: 'close' },
          {
            label: 'Hide to Tray',
            accelerator: 'CmdOrCtrl+H',
            click: () => {
              this.mainWindow.hide()
            }
          }
        ]
      }
    ]

    const menu = Menu.buildFromTemplate(template)
    Menu.setApplicationMenu(menu)
  }

  setupIPC() {
    // Handle navigation requests from renderer
    ipcMain.on('app-navigate', (event, route) => {
      // Handle any app-specific navigation logic here
      console.log(`Navigation requested to: ${route}`)
    })

    // Handle data export
    ipcMain.on('export-data-ready', (event, data) => {
      // Handle exported data from renderer process
      console.log('Export data received from renderer')
    })

    // Handle offline status
    ipcMain.on('network-status', (event, isOnline) => {
      // Update tray tooltip based on network status
      const status = isOnline ? 'Online' : 'Offline'
      this.tray.setToolTip(`KRTJ Desktop - ${status}`)
    })
  }

  async initialize() {
    // Set up dark mode before app is ready
    if (process.platform === 'win32') {
      // Force dark mode system-wide
      nativeTheme.themeSource = 'dark'
      
      // Handle theme changes
      nativeTheme.on('updated', () => {
        if (this.mainWindow) {
          this.mainWindow.webContents.send('theme-changed', nativeTheme.shouldUseDarkColors)
        }
      })
    }

    // Wait for app to be ready
    await app.whenReady()

    // Force dark mode again after app is ready (Windows workaround)
    if (process.platform === 'win32') {
      nativeTheme.themeSource = 'dark'
    }

    // Create main window
    this.createWindow()

    // Create system tray
    this.createTray()

    // Create application menu (disabled - using hidden menu bar instead)
    // this.createMenu()

    // Setup IPC handlers
    this.setupIPC()

    // Handle app activation (macOS)
    app.on('activate', () => {
      if (BrowserWindow.getAllWindows().length === 0) {
        this.createWindow()
      } else {
        this.mainWindow.show()
      }
    })

    // Handle all windows closed
    app.on('window-all-closed', () => {
      if (process.platform !== 'darwin') {
        this.isQuiting = true
        app.quit()
      }
    })

    // Handle before quit
    app.on('before-quit', () => {
      this.isQuiting = true
    })

    console.log('🚀 KRTJ Desktop App initialized successfully!')
  }
}

// Initialize the application
const krtjApp = new KRTJDesktopApp()
krtjApp.initialize().catch(console.error)
