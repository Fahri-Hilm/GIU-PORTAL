# GIU Intelligence Portal — Handoff

**Tanggal**: Wed Jul 01 2026
**Lokasi**: /home/iqaruz/Downloads/GIU/
**Status**: BUILD LULUS, dev server jalan, verifikasi browser tertunda (Chrome belum terinstall)

## Apa yang sudah selesai

### Stack sesuai PRD
Migrasi dari Vite scaffold → **Next.js 15** (App Router) + **TypeScript** + **Tailwind v4** + **Supabase** + **React Konva** + **Zustand** + **TanStack Query** + **Zod** + **shadcn/ui-style primitives** (Radix + CVA) + **Framer Motion** (motion pkg) + **Sonner**.

### File struktur
```
GIU/
├── src/
│   ├── app/
│   │   ├── layout.tsx              # root layout (boot screen + globals.css)
│   │   ├── page.tsx                 # redirect → /dashboard
│   │   ├── login/
│   │   │   ├── page.tsx             # Suspense boundary (useSearchParams)
│   │   │   └── login-form.tsx       # auth UI (mock bypass)
│   │   ├── (app)/
│   │   │   ├── layout.tsx           # Providers + AuthGuard
│   │   │   ├── dashboard/page.tsx   # stats + threat distribution + activity
│   │   │   ├── map/
│   │   │   │   ├── page.tsx         # dynamic import (ssr:false)
│   │   │   │   └── intelligence-map.tsx  # Konva canvas
│   │   │   ├── organizations/page.tsx    # CRM list + drawer
│   │   │   ├── investigations/page.tsx
│   │   │   ├── operations/page.tsx
│   │   │   ├── activity/page.tsx
│   │   │   └── settings/page.tsx
│   │   └── api/auth/
│   │       ├── login/route.ts      # POST login (mock cookie | supabase)
│   │       └── logout/route.ts
│   ├── components/
│   │   ├── app-shell.tsx            # client (uses useUIStore)
│   │   ├── auth-guard.tsx           # init auth + redirect ke /login
│   │   ├── sidebar.tsx              # dari App.tsx lama, ported
│   │   ├── topbar.tsx
│   │   ├── background-canvas.tsx    # WebGL shader (port dari lama)
│   │   ├── cursor-glow.tsx          # raf-throttled
│   │   ├── providers.tsx            # QueryClient + MockSubscription + Toaster + ModeBadge
│   │   ├── stat-card.tsx
│   │   └── ui/                       # button, input, form, badge, card, dialog, sheet, select, dropdown-menu, tabs, avatar, misc
│   ├── lib/
│   │   ├── utils.ts                 # cn + formatRelativeTime + initials
│   │   ├── constants.ts             # THREAT_META, NAV_ITEMS, MAP_DIMENSIONS
│   │   ├── types.ts                 # Organization, MapMarker, Territory, Investigation, Operation, Mission, ActivityEvent, Profile
│   │   ├── schema.ts                # Zod schemas (org, marker, territory, investigation, operation, mission, login)
│   │   ├── icons.ts                 # lucide registry
│   │   ├── data.ts                  # data access layer (supabase | mock auto-fallback)
│   │   ├── queries.ts               # React Query hooks (useOrganizations, useMarkers, dll)
│   │   ├── supabase/
│   │   │   ├── client.ts            # browser client + isSupabaseConfigured flag
│   │   │   ├── server.ts            # server client (cookies) + service role
│   │   │   └── middleware.ts        # session refresh
│   │   └── mock/
│   │       ├── seed.ts              # 10 org, 16 marker, 6 territory, 5 inv, 4 op, 3 mission, 8 activity
│   │       └── store.ts             # localStorage + custom event
│   ├── stores/
│   │   ├── auth.ts                  # zustand persist
│   │   ├── ui.ts                    # sidebar collapse + cursor glow
│   │   └── map.ts                   # zoom, center, mode, territory draft
│   └── middleware.ts                 # mock session check | supabase updateSession
├── supabase/migrations/0001_init.sql # schema + RLS + storage bucket + triggers
├── public/
│   ├── map.webp                      # GTA SA map (970×970)
│   └── logo-giu.jpg
├── next.config.ts                   # webpack canvas fallback untuk Konva
├── tsconfig.json
├── postcss.config.mjs
├── package.json
├── .env.example                      # template Supabase
├── .env.local                        # kosong → mock mode
├── .gitignore
└── README.md
```

## Fitur yang sudah berfungsi

### Login
- Mock mode: email/password apa pun diterima, cookie `giu_mock_auth`
- Supabase mode: `signInWithPassword` via `/api/auth/login` route handler
- Middleware redirect: unauthenticated → `/login`, authenticated di `/login` → `/dashboard`

### Dashboard
- 4 StatCard (org, investigasi aktif, operasi berlangsung, insiden)
- Distribusi tingkat ancaman (bar progress dengan warna)
- Organisasi prioritas (critical + high, top 5)
- Aktivitas terkini (6 event terbaru)

### Intelligence Map (Konva)
- Background WebGL shader (port dari BackgroundCanvas.tsx lama)
- GTA SA map sebagai Konva.Image background
- Zoom (wheel + button), pan (drag), reset view
- 5 tipe marker dengan shape berbeda: HQ (hexagon), stash (square), meetup (circle), incident (triangle), asset (star)
- Marker draggable + auto-save koordinat
- Territory polygon (dashed border, fill warna org, label)
- Mode "add-marker": klik map → sheet edit muncul
- Mode "add-territory": klik titik → save polygon
- Toggle visibility territories + labels
- Sheet edit marker (label, type, threat, org, koordinat, notes, delete)

### Organizations CRM
- Grid card list dengan filter (search + threat level)
- Card menampilkan logo/initials, alias, anggota, threat badge, updated time
- Create dialog (nama, alias, tahun, deskripsi, threat, anggota, warna)
- Profile drawer (Sheet) dengan 3 tabs:
  - **Profil**: edit inline (logo upload via Supabase Storage / FileReader fallback)
  - **Misi**: list + tambah + hapus
  - **Wilayah**: list + hapus + link ke /map
- Delete org (cascade hapus markers, territories, missions di mock mode)

### Investigations
- Grid card dengan filter (search + status)
- Case number otomatis `GIU-{year}-{seq}`
- Create dialog (judul, org, prioritas, analis, ringkasan)
- Detail dialog dengan status workflow (active ↔ pending ↔ closed)

### Operations
- Grid card dengan filter status
- Codename, objective, lead operator, participants, executed_at
- Create dialog (codename, org target, tujuan, operator, peserta, ringkasan)
- Status progression button (planning → active → completed)

### Activity Feed
- Timeline grouped by day (weekday, date)
- 10 tipe event dengan icon + color meta
- Filter by type

### Settings
- Profil operator (nama, pangkat) — local save
- Toggle cursor glow
- Mode badge (LIVE vs MOCK)
- Reset mock data button
- Sign out

## Status verifikasi

| Item | Status |
|---|---|
| `npx tsc --noEmit` | LULUS (no errors) |
| `npm run build` | LULUS (14 routes ter-generate) |
| `npm run dev` | JALAN (Ready in 1.5s) |
| Browser QA (Playwright) | **TERTUNDA** — Chrome belum terinstall |

### Build output terakhir
```
Route (app)                              Size     First Load JS
┌ ○ /                                    137 B           106 kB
├ ○ /activity                             5.3 kB          226 kB
├ ƒ /api/auth/login                       342 B          171 kB
├ ƒ /api/auth/logout                      342 B          171 kB
├ ○ /dashboard                            5.83 kB         204 kB
├ ○ /investigations                       5.23 kB         240 kB
├ ○ /login                                2.64 kB         216 kB
├ ○ /map                                  1.47 kB         107 kB
├ ○ /operations                           4.87 kB         240 kB
├ ○ /organizations                        12.8 kB         247 kB
└ ○ /settings                             7.3 kB          203 kB
```

## Cara melanjutkan

### 1. Start dev server
```bash
cd /home/iqaruz/Downloads/GIU
npm run dev
# buka http://localhost:3000
```

### 2. (Optional) Install Chrome untuk Playwright QA
```bash
npx playwright install chrome
# butuh sudo password untuk install system deps
# alternatif: install chromium saja
npx playwright install chromium
```

### 3. Manual QA checklist (sebelum declare done)
- [ ] Buka `http://localhost:3000` → redirect ke `/login`
- [ ] Login dengan email/password apa pun (mock mode) → masuk `/dashboard`
- [ ] Cek dashboard: 4 stat card terisi, bar threat distribution, list aktivitas
- [ ] Klik "Peta Intelijen" di sidebar → map Konva render dengan GTA bg
- [ ] Scroll wheel → zoom in/out
- [ ] Drag background → pan
- [ ] Klik marker (hex/square/circle/triangle/star) → sheet edit muncul
- [ ] Drag marker → koordinat update
- [ ] Klik tombol `+` di kanan bawah → mode add-marker, klik map → sheet baru
- [ ] Klik tombol hexagon → mode add-territory, pilih org, klik 3+ titik, simpan
- [ ] Klik "Organisasi" → grid card muncul
- [ ] Klik card → drawer dengan 3 tab (Profil/Misi/Wilayah)
- [ ] Klik pencil → edit inline, upload logo (FileReader fallback)
- [ ] Klik "ORGANISASI BARU" → dialog create
- [ ] Klik "Investigasi" → list kasus, buka detail, ubah status
- [ ] Klik "Operasi" → list, advance status
- [ ] Klik "Umpan Aktivitas" → timeline grouped by day
- [ ] Klik "Pengaturan" → toggle cursor glow, reset mock, sign out

### 4. (Optional) Colok Supabase
1. Buat project di https://supabase.com
2. Copy `.env.example` → `.env.local`, isi:
   ```
   NEXT_PUBLIC_SUPABASE_URL=https://<project>.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
   SUPABASE_SERVICE_ROLE_KEY=eyJ...
   ```
3. Paste `supabase/migrations/0001_init.sql` ke Supabase SQL editor → Run
4. Buat bucket storage `organizations` (sudah ada di migration)
5. Buat user di Auth → login
6. Badge di sidebar berubah dari `MOCK` → `LIVE`

## Hal yang perlu diperhatikan saat resume

- **Dev server**: sebelum stop, aku kill PID 36138. Start ulang dengan `npm run dev`.
- **Log dev terakhir**: `/tmp/giu-dev.log` (sudah terhapus saat reboot, tapi build masih aman).
- **Mock data reset**: kalau ada data aneh di localStorage, buka DevTools → Application → Local Storage → hapus `giu_mock_db_v1` dan `giu-auth`. Atau dari Settings → "Reset Data Mock ke Awal".
- **TypeScript**: `npm run typecheck` clean. Jangan tambah `as any` / `@ts-ignore`.
- **Comments**: hook akan nag kalau ada comment/docstring baru. Hanya simpan yang prioritas 3 (algoritma kompleks / keamanan / framework non-obvious). Aku sudah hapus semua section comments redundan di `data.ts` dan SQL. Yang tersisa:
  - `next-env.d.ts` triple-slash reference (framework wajib)
  - SQL `-- GIU Intelligence Portal schema...` (cara apply migration, operational)
  - SQL `-- RLS: authenticated operators...` (security justification)
  - `server.ts` catch block comment (framework behavior non-obvious)

## Known issues / catatan

1. **Supabase SSR edge runtime warning**: `process.version` di `@supabase/supabase-js` → warning saat build middleware, tapi tidak fatal. Build tetap sukses.
2. **react-konva 19 + React 19**: versi `react-konva@19.0.0` cocok dengan React 19. Kalau ada runtime error "Cannot read props of null", cek `useRef<Konva.Stage>` di `intelligence-map.tsx`.
3. **Konva SSR**: `next.config.ts` sudah set `canvas: false` fallback. Map page pakai `dynamic(() => ..., { ssr: false })`.
4. **Tailwind v4**: config langsung di `globals.css` via `@theme`, tidak ada `tailwind.config.ts`. Custom spacing `p-gutter-md`, `w-sidebar-width`, dll work via CSS variable.
5. **Logo upload**: mock mode pakai `FileReader.readAsDataURL` (data URL disimpan di localStorage — bisa besar). Supabase mode pakai storage public URL.

## PRD compliance checklist

| PRD requirement | Status |
|---|---|
| Next.js 15 | ✅ 15.1.6 |
| TypeScript | ✅ strict |
| Tailwind CSS v4 | ✅ 4.0.0 |
| shadcn/ui | ✅ CVA + Radix primitives |
| Framer Motion | ✅ `motion` pkg + CSS animations |
| React Konva | ✅ 19.0.0 |
| Zustand | ✅ 5.0.2 |
| TanStack Query | ✅ 5.62.0 |
| Next.js Route Handlers | ✅ `/api/auth/login`, `/api/auth/logout` |
| Supabase SDK | ✅ `@supabase/ssr` + `@supabase/supabase-js` |
| Zod Validation | ✅ `src/lib/schema.ts` |
| Vercel | ✅ Next.js deploy-ready |
| Supabase PostgreSQL | ✅ migration `0001_init.sql` |
| Supabase Storage | ✅ bucket `organizations` + RLS policies |
| Login | ✅ |
| Dashboard | ✅ |
| Intelligence Map | ✅ |
| Organizations CRM | ✅ |
| Investigations | ✅ |
| Operations | ✅ |
| Activity Feed | ✅ |
| Settings | ✅ |
| Map: zoom/pan | ✅ |
| Map: drag markers | ✅ |
| Map: CRUD markers | ✅ |
| Map: territory visualization | ✅ |
| Map: click-to-open org profile | ✅ (link dari marker sheet) |
| CRM: upload logo | ✅ |
| CRM: edit info | ✅ |
| CRM: threat levels | ✅ |
| CRM: create missions | ✅ |
| CRM: manage territories | ✅ |

Semua item PRD ter-cover. Tinggal browser QA untuk confirm visual + interaction.

## File index penting

- [PRD asli](file:///home/iqaruz/Downloads/GIU/PRD.txt)
- [README](file:///home/iqaruz/Downloads/GIU/README.md)
- [Root layout](file:///home/iqaruz/Downloads/GIU/src/app/layout.tsx)
- [App layout (Providers + AuthGuard)](file:///home/iqaruz/Downloads/GIU/src/app/(app)/layout.tsx)
- [Login form](file:///home/iqaruz/Downloads/GIU/src/app/login/login-form.tsx)
- [Dashboard](file:///home/iqaruz/Downloads/GIU/src/app/(app)/dashboard/page.tsx)
- [Intelligence Map (Konva)](file:///home/iqaruz/Downloads/GIU/src/app/(app)/map/intelligence-map.tsx)
- [Organizations CRM](file:///home/iqaruz/Downloads/GIU/src/app/(app)/organizations/page.tsx)
- [Investigations](file:///home/iqaruz/Downloads/GIU/src/app/(app)/investigations/page.tsx)
- [Operations](file:///home/iqaruz/Downloads/GIU/src/app/(app)/operations/page.tsx)
- [Activity Feed](file:///home/iqaruz/Downloads/GIU/src/app/(app)/activity/page.tsx)
- [Settings](file:///home/iqaruz/Downloads/GIU/src/app/(app)/settings/page.tsx)
- [Data access layer](file:///home/iqaruz/Downloads/GIU/src/lib/data.ts)
- [React Query hooks](file:///home/iqaruz/Downloads/GIU/src/lib/queries.ts)
- [Zod schemas](file:///home/iqaruz/Downloads/GIU/src/lib/schema.ts)
- [SQL migration + RLS](file:///home/iqaruz/Downloads/GIU/supabase/migrations/0001_init.sql)
- [Middleware](file:///home/iqaruz/Downloads/GIU/src/middleware.ts)
- [Design system (globals.css)](file:///home/iqaruz/Downloads/GIU/src/app/globals.css)
