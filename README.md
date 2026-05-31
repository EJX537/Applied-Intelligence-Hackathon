# WellPath — Patient Health App Mockup

A Next.js mobile app UI mockup for a patient wellness program. Designed for screenshot handoff to app developers.

## Features

- **Home screen** — daily check-in dashboard with score, completion rate, and $25 milestone rewards (months 1, 3, 6)
- **Oral Health** — 4 daily questions with hidden point-based scoring (out of 100, 15% daily weight)
- **Food & Diet** — meal photo upload with mock AI agent nutrition analysis (calories, macros, diet score at 35% daily weight)
- **Step Counts & Lab Data** — home cards (detail screens not yet implemented)

## Getting started

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to view the phone mockup.

## Tech stack

- [Next.js 16](https://nextjs.org/)
- [React 19](https://react.dev/)
- [Tailwind CSS 4](https://tailwindcss.com/)
- TypeScript

## Project structure

```
app/
  app-mockup.tsx           # Main client component (screens & navigation)
  oral-health-questions.ts # Oral health questions & scoring logic
  page.tsx                 # Entry point
```

## Scoring overview

| Section      | Daily weight | Input                        |
|-------------|--------------|------------------------------|
| Steps       | 30%          | Phone/wearable or manual     |
| Food & Diet | 35%          | Meal photo → AI analysis     |
| Oral Health | 15%          | 4 daily questions            |
| Lab Results | Review only  | Provider entry every 3 mo.   |

Reward eligibility: $25 at months 1, 3, and 6 based on monthly score, completion rate, and lab results.
