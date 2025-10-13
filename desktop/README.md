# KRTJ Desktop App# Kinsfolk Republic — Trading Journal



## OverviewClient-only trading journal app storing everything in browser LocalStorage. Built with React + Vite + Tailwind. Designed for deployment on Vercel.

Desktop version of Kinsfolk Republic Trading Journal built with Electron. This provides an offline-capable trading journal application with all the features of the web version.

Features

## Features- Vision board (image cards)

- Trade journal with image uploads

### ✅ Offline Capabilities- Playbook (strategies) with markdown

- **Trading Journal**: Full offline functionality for recording trades- Charts gallery compiled from uploaded chart images

- **Dashboard Analytics**: Complete offline access to your trading statistics- Wallet (deposits/withdrawals) and basic dashboard stats

- **Vision Board**: Set and track your trading goals offline- Export / Import / Delete all data (local only)

- **Strategy Playbook**: Access your trading strategies without internet

Quick start

### 🌐 Online Features (requires internet)

- **Live Market Data**: Real-time crypto, stock, and forex prices1. Install dependencies

- **AI Trading Assistant**: Powered by Groq LLM for intelligent trading insights

- **Market News**: Latest trading news and market updates```powershell

cd C:\Users\jeral\Downloads\Kinsfolk_Republic_Trading_Journal

### 🖥️ Desktop Enhancementsnpm install

- **System Tray Integration**: Quick access from system tray```

- **Native Menus**: Full desktop menu system with keyboard shortcuts

- **Window Management**: Minimize to tray, restore from tray2. Run dev server

- **Cross-Platform**: Works on Windows, macOS, and Linux

- **No Account Required**: Complete privacy - all data stays on your device```powershell

npm run dev

## Development Setup```



### Prerequisites3. Build

- Node.js 18+ installed

- Git (for version control)```powershell

npm run build

### Installation```

```bash

# Clone or use existing KRTJ projectDeploying to Vercel

cd KRTJ_Desktop_App

- Connect the repo to Vercel and use the default settings. Vercel will run `npm run build` and publish the `dist` folder.

# Install dependencies

npm installData storage

- All user data is stored in LocalStorage under the key `kr_trading_journal_v1`.

# For development (starts both Vite and Electron)- Use Data Settings to export a JSON file, import (merge/overwrite), or delete all data (double-click confirmation).

npm run electron-dev

Notes

# For production build- No backend or external data storage. All images are stored as base64 data URLs inside LocalStorage — large images may increase storage size.

npm run build:electron- Consider adding IndexedDB or using file references for large-scale usage in the future.

```

## Available Scripts

### Development
- `npm run dev` - Start Vite development server only
- `npm run electron` - Start Electron with built files
- `npm run electron-dev` - Start both Vite and Electron for development

### Building
- `npm run build` - Build web assets with Vite
- `npm run build:electron` - Build complete Electron app
- `npm run pack` - Package app without installer
- `npm run dist` - Create distributable installer

### Platform-Specific Builds
- `npm run dist:win` - Build Windows installer (NSIS)
- `npm run dist:mac` - Build macOS DMG
- `npm run dist:linux` - Build Linux AppImage

## Desktop-Specific Features

### System Tray Menu
- Show/Hide main window
- Quick navigation to major sections
- Network status indicator
- About dialog
- Quit application

### Keyboard Shortcuts
- `Ctrl+N` (Cmd+N) - New Trade Entry
- `Ctrl+D` (Cmd+D) - Dashboard
- `Ctrl+J` (Cmd+J) - Journal
- `Ctrl+V` (Cmd+V) - Vision Board
- `Ctrl+S` (Cmd+S) - Strategies
- `Ctrl+M` (Cmd+M) - Market Data
- `Ctrl+A` (Cmd+A) - AI Assistant
- `Ctrl+H` (Cmd+H) - Hide to Tray

### Native Menus
- **File**: New trade, export data, quit
- **Trading**: Navigate to different sections
- **Market**: Access online features
- **View**: Zoom, fullscreen, developer tools
- **Window**: Minimize, close, hide to tray

## Network Status Handling

The app automatically detects online/offline status:

### Online Mode
- Full access to all features
- Live market data updates
- AI assistant functionality
- Real-time news feeds

### Offline Mode
- Trading journal remains fully functional
- Dashboard analytics work with existing data
- Vision board and strategies accessible
- Graceful degradation for online features

## File Structure

```
KRTJ_Desktop_App/
├── main.js              # Electron main process
├── preload.js           # Electron preload script
├── package.json         # Desktop app configuration
├── src/                 # React application source
├── public/              # Static assets
├── dist/                # Built web assets (after npm run build)
└── electron-dist/       # Electron distributables (after build)
```

## Building for Distribution

### Windows (NSIS Installer)
```bash
npm run dist:win
```
Creates: `electron-dist/KRTJ Desktop Setup 1.0.0.exe`

### macOS (DMG)
```bash
npm run dist:mac
```
Creates: `electron-dist/KRTJ Desktop-1.0.0.dmg`

### Linux (AppImage)
```bash
npm run dist:linux
```
Creates: `electron-dist/KRTJ Desktop-1.0.0.AppImage`

## Security & Privacy

- **No Data Collection**: All data stays on your local device
- **No Accounts Required**: No registration or login needed
- **Secure Context**: All web APIs run in secure, sandboxed environment
- **Local Storage**: Trades and settings stored locally using browser APIs

## Troubleshooting

### Development Issues
1. **Port 5173 in use**: Kill existing Vite processes or change port in vite.config.ts
2. **Electron won't start**: Ensure main.js and preload.js exist in root directory
3. **Build fails**: Check Node.js version (requires 18+)

### Runtime Issues
1. **App won't minimize to tray**: Check if system tray is available on your OS
2. **Online features not working**: Check internet connection and firewall settings
3. **Performance issues**: Close developer tools if opened accidentally

## Environment Variables

Copy `.env` file from web version or create new one:

```env
VITE_GROQ_API_KEY=your_groq_api_key_here
```

## Updates & Maintenance

The desktop app shares the same codebase as the web version, so updates to features automatically carry over. Only desktop-specific files need separate maintenance:

- `main.js` - Electron main process
- `preload.js` - Renderer security context  
- `package.json` - Build configuration
- This README file

## Version History

- **v1.0.0** - Initial desktop release
  - Full feature parity with web version
  - System tray integration
  - Cross-platform support
  - Offline-first architecture

---

## Quick Start Guide

### 1. Test Development Mode
```bash
npm run electron-dev
```
This will start both the Vite dev server and Electron app.

### 2. Test Production Build
```bash
npm run build:electron
```
This builds and packages the app for your current platform.

### 3. Create Installer (Windows)
```bash
npm run dist:win
```
Creates a Windows installer in the `electron-dist` folder.

**Your KRTJ Desktop App is ready!** 🚀

All your trading data stays private on your local machine, with the flexibility to work online or offline.