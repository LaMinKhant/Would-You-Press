# Quiz Game — Vercel Deploy Guide

## Project Structure

```
project-root/
├── index.html      ← Game UI (Question only)
├── vercel.json     ← Vercel config
└── api/
    └── check.js    ← Server-side answer checker (SECRET)
```

## Security

- Question တွေက `index.html` ထဲမှာ 
- Inspect / DevTools နဲ့ ကြည့်ရင် questions တွေပဲ မြင်ရမယ်
- အဖြေစစ်တာ `api/check.js` (server) မှာပဲ ဖြစ်တယ်

## Deploy Steps

### 1. GitHub repo
```bash
git init
git add .
git commit -m "initial commit"
git remote add origin https://github.com/YOUR_USER/YOUR_REPO.git
git push -u origin main
```

### 2. Vercel import
1. https://vercel.com → **Add New Project**
2. GitHub repo ကို select လုပ်ပါ
3. **Deploy** နှိပ်ပါ — အဆင်ပြေသွားမယ်

- Vercel က `api/check.js` ကို auto-detect လုပ်ပြီး serverless endpoint ဖြစ်သွားမယ်
- Game က `/api/check` ကို POST call လုပ်ပြီး correct/wrong ပဲ ပြန်မယ်

## API Response

```json
// POST /api/check
// Request: { qId, pressed, eventReady, ... }
// Response:
{ "correct": true }   // or false
// Answers တွေကို response မှာ မပြန်ဘူး
```
