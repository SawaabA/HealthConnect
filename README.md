# MapleVault Frontend Prototype

Polished frontend-only UX/UI prototype for a healthcare data consent platform built with:

- Next.js (App Router)
- TypeScript
- Tailwind CSS
- Reusable React component architecture

## Scope

This project intentionally includes only frontend UX/UI with mock data.

Included:

- Landing page and role gateway
- Mock login pages by role
- Patient, Guardian, Doctor, Researcher, and Admin dashboards
- Data request details page with role-aware actions
- Record viewer with category navigation
- Appointment booking UX with mock slots
- Reusable assistant/chatbot UI with patient and doctor variants
- Role-aware app shell (sidebar, topbar, notifications, profile controls)

Not included:

- Real authentication
- Backend APIs
- Database
- Real appointment booking logic
- Real AI/LLM integrations

## Run locally

```bash
npm install
npm run dev
```

Open `http://localhost:3000`.

## Folder structure

- `app/` routes and pages (App Router)
- `components/ui/` reusable primitive UI components
- `components/layout/` app shell, sidebar, topbar, public header
- `components/assistant/` avatars, chat panel, insight cards, suggestions
- `components/dashboard/` cards, forms, request/timeline/records modules
- `data/` mock data for all pages
- `types/` TypeScript interfaces and shared types
- `lib/` utility helpers
