# P JARVAS — Full-featured web starter

Includes responsive chat UI, Gemini text/image requests through a private server endpoint, browser speech input/output where supported, user-approved one-frame screen sharing, local chat memory, export/delete controls, and small utility actions.

## Security first
- A Gemini API key was previously pasted into a chat. Revoke that exposed key and create a new one before deploying.
- Keep the new key only in the hosting provider's private environment variables as `GEMINI_API_KEY`. Never put it in `public/index.html`, GitHub, or a screenshot.
- The browser sends requests to this app's `/api/chat`; the server calls Gemini. The server has basic rate limiting, but this is a starter, not a complete multi-user production security system. Add authentication/usage quotas before sharing publicly.
- Image/screen frames you send are sent to the configured AI provider. Screen capture is only requested after you tap Share screen; browser consent is required, one frame is captured, and the stream is stopped.

## Deploy from a phone (general Node hosting)
1. Create a private GitHub repository and upload the contents of this folder. Do NOT upload `.env` or API keys. `.gitignore` blocks `.env`.
2. On a Node.js hosting service, create a new web service from that repository.
3. Use build/install command `npm install` and start command `npm start`. Choose Node 20 or newer.
4. In the host's Environment Variables/Secrets settings, add `GEMINI_API_KEY` = your new Gemini key. Optionally set `GEMINI_MODEL` to `gemini-2.5-flash`.
5. Deploy, open the public HTTPS URL, and wait until the status shows `Ready` (not `API key missing`).
6. In Android Chrome, open the URL. Use browser menu → Add to Home screen if available.

Host dashboards change; use the host's current official instructions. If deploying as a public app, do not publish it without authentication or quotas, because strangers could consume your API quota.

## Test locally (requires Node.js 20+)
1. Copy `.env.example` to `.env` and set `GEMINI_API_KEY` to your new key.
2. Run `npm install`, then `npm start`.
3. Open `http://localhost:3000`.

## Limits
- Voice recognition depends on browser/OS and often requires HTTPS. Voice output uses the browser's available voices; Nepali voice availability varies.
- Screen share works only in browsers that support `getDisplayMedia` on a secure context. Some mobile browsers don't support it; use a screenshot upload instead.
- Local memory is stored in this browser's localStorage, not synced across devices and not encrypted. Clear it on shared devices.
- This website cannot control other apps, access notifications, tap buttons in other apps, or continuously monitor the phone. Those require a native Android app, explicit permissions, and additional implementation.
- The app is a source starter; it has not been deployed or tested against your specific phone/browser/account.
