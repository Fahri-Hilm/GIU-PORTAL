# GIU Intelligence Portal

Premium intelligence dashboard for monitoring criminal organizations across San Andreas. Built per `PRD.txt` — interactive map-centric workflow with CRM, investigations, and operations management.

## Stack

- **Next.js 15** (App Router) + **TypeScript**
- **Tailwind CSS v4** + custom GIU design system (gold/dark, IBM Plex / Inter / Space Grotesk)
- **shadcn/ui-style** primitives (Radix UI + CVA)
- **React Konva** for the interactive intelligence map
- **Zustand** (UI + map state) + **TanStack Query** (server state)
- **Supabase** (PostgreSQL + Storage + Auth) with auto-fallback to mock mode
- **Zod** validation, **Framer Motion** animations, **Sonner** toasts

## Run Locally

```bash
npm install
npm run dev          # http://localhost:3000
```

App runs in **MOCK mode** out of the box (seeded San Andreas data, localStorage persistence). Login accepts any email + password.

## Connect Supabase (optional)

1. Create a Supabase project at https://supabase.com
2. Copy `.env.example` → `.env.local` and fill:
   ```
   NEXT_PUBLIC_SUPABASE_URL=https://<project>.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
   SUPABASE_SERVICE_ROLE_KEY=eyJ...   # server-only
   ```
3. Apply schema: paste `supabase/migrations/0001_init.sql` into the Supabase SQL editor, or `supabase db push` with the CLI.
4. Create a user in Supabase Auth (email/password), then log in.

The app auto-detects Supabase config and switches from mock to live mode (badge in sidebar shows `LIVE` vs `MOCK`).

## Modules

| Route | Description |
|---|---|
| `/login` | Auth (Supabase or mock bypass) |
| `/dashboard` | Stats, threat distribution, priority orgs, recent activity |
| `/map` | Konva canvas — zoom/pan, draggable markers, territories, CRUD, click-to-open |
| `/organizations` | CRM — logo upload, edit, threat levels, missions, territories |
| `/investigations` | Case list + status workflow |
| `/operations` | Field operations with status progression |
| `/activity` | Audit timeline across all modules |
| `/settings` | Profile, preferences, data reset, sign out |

## Intelligence Map

- **Zoom/pan**: mouse wheel + drag background
- **Markers**: draggable, 5 types (HQ / stash / meetup / incident / asset), threat-colored, click to edit
- **Territories**: polygon drawing mode, org-colored, dashed borders
- **Add marker**: toggle mode → click map → fill detail panel
- **Add territory**: toggle mode → pick org → click points → save

## Assets

- `public/map.webp` — GTA San Andreas map (970×970)
- `public/logo-giu.jpg` — GIU logo

## Scripts

```bash
npm run dev        # dev server
npm run build      # production build
npm run start      # serve production build
npm run typecheck  # tsc --noEmit
```
