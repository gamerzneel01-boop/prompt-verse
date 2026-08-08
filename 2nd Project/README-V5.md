# Prompt-Verse v5 — Real AI Backend

## What changed
- Added a secure Vercel serverless endpoint at `api/generate.js`.
- The browser never receives `OPENAI_API_KEY`.
- Main Prompt Generator now calls the backend and uses real AI.
- Prompt Improver now calls the backend and uses real AI.
- Local template fallback remains available if the backend is not configured or temporarily fails.
- Added `vercel.json`, `package.json`, and `.env.example`.

## Recommended deployment: Vercel
1. Create/import the project in Vercel.
2. Add environment variable `OPENAI_API_KEY` in Vercel Project Settings → Environment Variables.
3. Optionally set `OPENAI_MODEL` (default: `gpt-5.6-luna`).
4. Deploy.
5. Open your deployed site and test **Generate Prompt**.

## Local development
Install Vercel CLI, then run:
`vercel dev`

Put your key in a local `.env.local` file (never commit it):
`OPENAI_API_KEY=...`
`OPENAI_MODEL=gpt-5.6-luna`

## Important
- Do NOT put the API key into `script.js`, `index.html`, or any public asset.
- Before making the site public, add proper authentication/rate limiting and usage controls so strangers cannot abuse your API budget.
