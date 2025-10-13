# KRTJ Desktop Downloads

This folder contains the desktop application installer files and version management system.

## File Structure:
- `KRTJ-Desktop-Setup.exe` - Latest Windows installer (uploaded to hosting, not in Git)
- `version.json` - Current version and changelog information
- `archive/` - Version history (last 2 versions for reference and rollback)

## Version Management Strategy:

### Archive Policy:
- Keep last 2 versions in `archive/` folder for rollback and comparison
- Remove versions older than 2 releases to maintain clean repository
- Version JSON files are lightweight and safe for Git tracking
- Large installer files are never committed to Git (excluded via .gitignore)

### Deployment Process:
1. **Build New Installer**: Create new version with `npm run dist`
2. **Archive Previous**: Move current version.json to archive/version-X.X.X.json
3. **Update Current**: Update version.json with new version info
4. **Clean Repository**: Remove old installer files from Git tracking
5. **Upload Installer**: Manually upload new installer to web hosting
6. **Deploy Code**: Push version.json and archive changes to repository

### Benefits:
- ✅ Lightweight repository (no large binaries in Git)
- ✅ Version history for comparison and emergency rollback
- ✅ Clean deployment process with automated version management
- ✅ Fast Git operations and reduced repository size
- ✅ Easy change tracking between versions
2. Copy installer to this folder as `KRTJ-Desktop-Setup.exe`
3. Update `version.json` with new version info and changelog
4. Deploy website - users get direct downloads!

## Auto-Update Integration:
The desktop app checks `version.json` for updates and displays changelogs to users.