# KRTJ Desktop Downloads

This folder contains the desktop application installer files.

## File Structure:
- `KRTJ-Desktop-Setup.exe` - Latest Windows installer
- `version.json` - Version and changelog information

## Deployment Process:
1. Build new desktop app version
2. Copy installer to this folder as `KRTJ-Desktop-Setup.exe`
3. Update `version.json` with new version info and changelog
4. Deploy website - users get direct downloads!

## Auto-Update Integration:
The desktop app checks `version.json` for updates and displays changelogs to users.