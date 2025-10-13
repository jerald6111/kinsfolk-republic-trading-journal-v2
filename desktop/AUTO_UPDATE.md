# Auto-Update Configuration for KRTJ Desktop

This document explains the auto-update functionality implemented in the desktop application.

## How It Works

The desktop app uses **electron-updater** to automatically check for and install updates from GitHub Releases.

### Update Process:
1. **Automatic Check**: App checks for updates 5 seconds after startup
2. **Manual Check**: Users can check via system tray → "Check for Updates"
3. **Download Prompt**: If update found, user is asked to download
4. **Background Download**: Update downloads while app continues running
5. **Install Prompt**: When ready, user is prompted to restart and install

### GitHub Releases Integration:
- Updates are published to: `https://github.com/jerald6111/kinsfolk-republic-trading-journal-v2/releases`
- Auto-updater checks this repository for newer versions
- Only published releases trigger update notifications

## For Developers

### Publishing Updates:
```bash
# Build and publish new version to GitHub
npm run publish:win

# Or build without publishing
npm run dist:win
```

### Version Management:
1. Update `version` in `package.json`
2. Create new release on GitHub with same version tag
3. Upload the installer file to the release
4. Mark release as published

### User Experience:
- ✅ Non-intrusive: Users can continue working during download
- ✅ User control: All updates require user consent
- ✅ Graceful fallback: Manual updates still work if auto-update fails
- ✅ System tray integration: Easy access to update checks

## Benefits for Users

### Automatic Updates:
- 🔄 **Always Current**: Latest features and security fixes
- 🛡️ **Security**: Automatic security patches
- 🐛 **Bug Fixes**: Immediate access to fixes
- ✨ **New Features**: Get new trading tools as they're released

### User Control:
- 👤 **Optional**: Users choose when to update
- ⏰ **Flexible**: Can postpone updates if busy trading
- 🔄 **Background**: Downloads don't interrupt workflow
- 🚫 **Reversible**: Can always reinstall previous version

This ensures your desktop users stay up-to-date with the latest improvements while maintaining control over their update experience.