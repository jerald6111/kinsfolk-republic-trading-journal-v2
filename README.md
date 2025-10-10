# Kinsfolk Republic — Trading Journal

Client-only trading journal app storing everything in browser LocalStorage. Built with React + Vite + Tailwind. Designed for deployment on Vercel.

Features
- Vision board (image cards)
- Trade journal with image uploads
- Playbook (strategies) with markdown
- Charts gallery compiled from uploaded chart images
- Wallet (deposits/withdrawals) and basic dashboard stats
- Export / Import / Delete all data (local only)

Quick start

1. Install dependencies

```powershell
cd C:\Users\jeral\Downloads\Kinsfolk_Republic_Trading_Journal
npm install
```

2. Run dev server

```powershell
npm run dev
```

3. Build

```powershell
npm run build
```

Deploying to Vercel

- Connect the repo to Vercel and use the default settings. Vercel will run `npm run build` and publish the `dist` folder.

Data storage
- All user data is stored in LocalStorage under the key `kr_trading_journal_v1`.
- Use Data Settings to export a JSON file, import (merge/overwrite), or delete all data (double-click confirmation).

Notes
- No backend or external data storage. All images are stored as base64 data URLs inside LocalStorage — large images may increase storage size.
- Consider adding IndexedDB or using file references for large-scale usage in the future.
