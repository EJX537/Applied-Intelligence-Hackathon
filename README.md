# VitaTracker — Health Monitoring App

VitaTracker addresses a critical gap in community health care: for adult clients managing chronic or at-risk conditions, care effectively stops at the clinic door. Without consistent monitoring between visits, progress is invisible, motivation fades, and providers have little visibility into how patients are doing day to day. Paper records and missed check-ins make it easy to overlook early warning signs, leaving a population with limited access to regular in-person care without the support they need between appointments.

The app bridges that gap by giving both clients and providers a shared mobile tool across a structured 6-month program. Clients complete health logs at baseline, 3 months, and 6 months covering four weighted indicators: lab results (35%), daily step count (25%), diet and food habits (25%), and oral hygiene (15%). Each client receives a composite progress score, and providers use the dashboard to monitor trends, identify who is falling below target, and intervene early when data raises concern. Clients who reach a score of 70% or improve by 12 or more points from their prior checkpoint earn a Safeway gift card, creating a tangible incentive to stay engaged through the full program.

Built with React, TypeScript, Vite, and Insforge backend.

## Structure

```
src/
├── features/
│   ├── admin/          # Provider dashboard, patient management, scoring
│   ├── food/           # Food logging with AI vision analysis
│   └── wellpath/       # Core patient experience
│       ├── components/ # SectionCard, ScoreCard, RewardsCard
│       ├── services/   # healthAi.ts, oralHealthApi.ts, rewardsApi.ts
│       └── types.ts
├── pages/              # Route pages
│   ├── AiPage.tsx            # User-facing AI chat
│   ├── AdminAiPage.tsx       # Admin AI chat
│   ├── WellPathHomePage.tsx  # Dashboard
│   ├── WellPathOralHealthPage.tsx
│   ├── WellPathLabDataPage.tsx
│   ├── ProviderDashboard.tsx # Provider view
│   └── ...
├── contexts/           # AuthContext, HealthKitContext
├── shared/
│   ├── api/            # openaiClient.ts, insforgeClient.ts
│   └── types/
└── hooks/
```

## Scoring

| Indicator | Weight |
|---|---|
| Lab results | 35% |
| Daily step count | 25% |
| Diet and food habits | 25% |
| Oral hygiene | 15% |

Clients earn a **Safeway gift card** if their composite score reaches **70%** or improves by **12+ points** from their prior checkpoint.

## Features

- **Dashboard** — daily health overview with step, diet, oral, and lab sections
- **Step tracking** — from Apple HealthKit via PWA Kit
- **Food logging** — log meals with nutritional breakdown
- **Oral health** — daily check-in form with score
- **Lab data** — clinical lab results visualization per checkpoint (baseline, 3mo, 6mo)
- **Rewards** — milestone-based Safeway gift card system
- **AI assistant** — OpenRouter-powered chat that answers from your real data
- **Provider dashboard** — manage patients, view checkpoints and trends, invite new patients
- **Early intervention** — providers can identify at-risk clients and intervene when data raises concern

## Getting started

```bash
# Install
npm install

# Set up environment
cp .env.example .env.local
# Fill in your Insforge and OpenRouter keys in .env.local

# Start dev server
npm run dev
```

## Environment

See `.env.example` for required variables:

| Variable | Description |
|---|---|
| `VITE_INSFORGE_URL` | Insforge backend URL |
| `VITE_INSFORGE_ANON_KEY` | Insforge anonymous key |
| `VITE_OPENROUTER_API_KEY` | OpenRouter API key for AI chat |

## Routes

| Route | Page |
|---|---|
| `/user` | Patient dashboard |
| `/user/ai` | AI assistant |
| `/user/steps` | Step details |
| `/user/oral-health` | Oral health check-in |
| `/user/food` | Food log |
| `/user/lab` | Lab data |
| `/user/admin` | Provider dashboard |
| `/user/admin/ai` | Admin AI assistant |
| `/user/settings` | Settings |

## Built with

- React 19 + TypeScript 6
- Vite 8
- Tailwind CSS 4
- Insforge SDK (backend)
- OpenRouter AI (OpenAI SDK)
- Recharts (charts)
- React Router 7
