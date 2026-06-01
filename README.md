# WellPath Health

A hackathon project — a health engagement platform where patients earn rewards through healthy behaviors. Built with React, TypeScript, Vite, and Insforge backend.

## Overview

WellPath lets patients track steps, nutrition, oral health, and clinical labs while earning voucher rewards. Providers manage patients and view progress dashboards. An AI assistant answers questions using the patient's real data.

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

## Features

- **Dashboard** — daily health overview with step, diet, oral, and lab sections
- **Step tracking** — from Apple HealthKit via PWA Kit
- **Food logging** — log meals with nutritional breakdown
- **Oral health** — daily check-in form with score
- **Lab data** — clinical lab results visualization per checkpoint
- **Rewards** — milestone-based voucher system
- **AI assistant** — OpenRouter-powered chat that answers from your real data
- **Provider dashboard** — manage patients, view checkpoints, invite new patients
- **Scoring** — weighted composite score: Labs 35%, Steps 25%, Diet 25%, Oral 15%

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
