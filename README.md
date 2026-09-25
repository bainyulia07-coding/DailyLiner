# DailyLiner

DailyLiner is an AI-powered adaptive daily planner with a natural-language assistant called Lina.

## Included
- Dashboard with daily progress and upcoming events
- My Schedule with Today / Tomorrow / This week / Upcoming views
- Long-term Calendar with month navigation and events across future years
- Tasks and goals
- Timers & reminders for things like washing machines, cooking, study sessions, and breaks
- Custom timer sound upload
- Browser notification permission support
- Custom themes and background styles
- About / Contact section and website-level header navigation
- Lina AI through the Node backend and Gemini API
- LocalStorage persistence for planner data, themes, events, and timers

## Run locally
1. Put your Gemini key in `.env` as `GEMINI_API_KEY=...`.
2. Install dependencies if needed: `npm install`.
3. Start: `npm start` (PowerShell may require `npm.cmd start`).
4. Open `http://localhost:3000`.

Never put the Gemini API key inside `public/app.js`.

## Timer note
Custom audio is stored locally in the browser as a data URL. Browser notification support depends on the browser and permission settings. For the strongest reminder behavior, keep the app open and allow notifications.
