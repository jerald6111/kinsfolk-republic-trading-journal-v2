# 🚀 Kinsfolk Republic Trading Journal - Unified Project

## 📁 Project Structure

This unified project contains both the **website** and **desktop app** in a single repository for easier maintenance and development.

```
├── 📁 src/                    # Web application source code
├── 📁 public/                 # Web application assets
├── 📁 desktop/                # Desktop application (Electron)
│   ├── 📁 src/               # Desktop app source (synced with web)
│   ├── 📁 public/            # Desktop app assets
│   ├── main.js               # Electron main process
│   ├── preload.js            # Electron preload script
│   └── package.json          # Desktop-specific dependencies
├── package.json              # Main web app dependencies
└── package-unified.json      # Unified build scripts
```

## 🛠️ Quick Start

### 1️⃣ Initial Setup
```bash
# Install web dependencies
npm install

# Install desktop dependencies  
npm run desktop:install
```

### 2️⃣ Development

**Web Development:**
```bash
npm run dev          # Start web dev server
npm run build        # Build web app
npm run preview      # Preview web build
```

**Desktop Development:**
```bash
npm run desktop:dev      # Start desktop app in dev mode
npm run desktop:build    # Build desktop app
npm run desktop:electron # Run built desktop app
```

### 3️⃣ Synchronization

**Sync Web → Desktop:**
```bash
npm run sync:to-desktop    # Copy web changes to desktop
```

**Sync Desktop → Web:**
```bash
npm run sync:from-desktop  # Copy desktop changes to web
```

### 4️⃣ Building & Distribution

**Build Everything:**
```bash
npm run build:all          # Build both web and desktop
```

**Desktop Installer:**
```bash
npm run desktop:pack       # Create desktop installer
npm run update:desktop     # Sync + build + package desktop
```

## 🔄 Workflow

### Making Changes to Both Web & Desktop:
1. Edit files in the main `src/` folder (web version)
2. Run `npm run sync:to-desktop` to copy changes to desktop
3. Test both versions:
   - Web: `npm run dev`
   - Desktop: `npm run desktop:electron`
4. Build and deploy:
   - Web: `npm run build` (auto-deploys via Vercel)
   - Desktop: `npm run desktop:pack` (creates installer)

### Desktop-Only Changes:
1. Edit files in `desktop/` folder
2. Test: `npm run desktop:electron`
3. Build: `npm run desktop:pack`

### Web-Only Changes:
1. Edit files in main `src/` folder  
2. Test: `npm run dev`
3. Build: `npm run build`

## ✅ Benefits of Unified Structure

- **🔄 Easy Synchronization** - Keep web and desktop in sync effortlessly
- **📦 Single Repository** - Easier version control and management
- **🚀 Streamlined Deployment** - Build both versions with one command
- **🛠️ Shared Dependencies** - Reduce duplication and maintenance overhead
- **📋 Consistent Updates** - Apply fixes to both versions simultaneously

## 🔧 Available Scripts

| Script | Description |
|--------|-------------|
| `dev` | Start web development server |
| `build` | Build web application |
| `desktop:dev` | Start desktop app in development |
| `desktop:build` | Build desktop application |
| `desktop:electron` | Run desktop app |
| `desktop:pack` | Create desktop installer |
| `sync:to-desktop` | Copy web → desktop |
| `sync:from-desktop` | Copy desktop → web |
| `build:all` | Build both web & desktop |
| `update:desktop` | Full desktop update pipeline |

## 📝 Notes

- The `desktop/` folder is essentially a copy of the web app with Electron wrapper
- Main development happens in the root `src/` folder
- Use sync scripts to keep desktop version updated
- Desktop-specific files (main.js, preload.js, etc.) stay in `desktop/`
- Both versions share the same UI components and logic