<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6" />
</div>

# Run and deploy your AI Studio app

This contains everything you need to run your app locally.

View your app in AI Studio: https://ai.studio/apps/78a695f3-4c33-4d0a-8b8a-efaceeb0a5b7

## Project layout

```
├── public/          # Static assets copied to dist as-is (favicon, manifests, etc.)
├── src/
│   ├── components/  # React UI
│   ├── lib/         # Non-UI helpers (e.g. storage)
│   ├── App.tsx      # Root component
│   ├── main.tsx     # Vite entry (mounts React)
│   ├── index.css    # Global styles
│   ├── constants.tsx
│   ├── types.ts
│   └── vite-env.d.ts
├── index.html       # HTML shell
├── vite.config.ts
└── tsconfig.json
```

The `@/` path alias points at `src/` (see `vite.config.ts` and `tsconfig.json`).

## Run Locally

**Prerequisites:**  Node.js


1. Install dependencies:
   `npm install`
2. Set the `GEMINI_API_KEY` in [.env.local](.env.local) to your Gemini API key
3. Run the app:
   `npm run dev`
