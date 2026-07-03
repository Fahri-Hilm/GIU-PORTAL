# UI/UX Overhaul — Full Portal Polish

## TL;DR

> **Quick Summary**: Fix all 11 UI/UX audit findings across the GIU Intelligence Portal — font replacement, reusable PageHeader, tactical atmosphere on all pages, master-detail list layouts, skeleton loaders, sidebar/topbar polish, mobile drawer, filter consistency.
> 
> **Deliverables**:
> - Font system: Chakra Petch (display) + IBM Plex Sans (body)
> - Reusable components: PageHeader, SkeletonLoader, TacticalCard
> - 9 pages polished with tactical atmosphere + PageHeader
> - 4 list pages converted to master-detail split layout
> - Sidebar + Topbar enhanced
> - Mobile drawer + mobile search
> - Filter consistency (search + select on all list pages)
> - Max-width standardization
> 
> **Estimated Effort**: Large
> **Parallel Execution**: YES - 3 waves
> **Critical Path**: T1 (font) → T2-T6 (foundation) → T7-T14 (pages) → T15-T18 (mobile/polish) → F1-F4

---

## Context

### Original Request
User asked for UI/UX suggestions across the entire portal. Audit found 11 issues: font choice violates skill guidelines, page headers inconsistent, tactical atmosphere only on 2 pages, dashboard layout too linear, list pages use slow sheet panels, missing loading states, filter inconsistency, sidebar/topbar lacking polish, max-width inconsistency, no mobile drawer.

### Interview Summary
**Key Discussions**:
- User confirmed: "plan semua" — fix all 11 items
- Members page is the gold standard — copy patterns to other pages
- No new dependencies — use existing stack (motion/react, @radix-ui/*, Tailwind v4)

**Research Findings**:
- Existing design system: IBM Plex Sans/Mono, Space Grotesk, gold primary #e6c383
- Skill explicitly says avoid: Inter, Space Grotesk, Arial, Roboto, system fonts
- Chakra Petch is a military/tactical Google Font that fits the portal's theme
- 9 pages in (app) route group: dashboard, map, markers, organizations, members, investigations, operations, activity, settings
- Existing tactical.tsx has: CornerBrackets, GridOverlay, ScanLine, TacticalFrame, StatusDot
- globals.css has: noise-overlay, scanlines, diagonal-accent, corner-brackets, stagger-children, grid-pattern, glass-panel

### Metis Review
Metis returned empty. Self-analysis used instead. Identified gaps:
- Font choice needs user confirmation (Chakra Petch vs alternatives)
- Mobile drawer pattern: overlay vs push
- Map page has canvas — tactical overlays might interfere
- Sheet panel in organizations might conflict with master-detail
- Settings page is form-heavy — max-width change might break forms

---

## Work Objectives

### Core Objective
Apply frontend-ui-ux skill principles consistently across all 9 portal pages, achieving visual cohesion, tactical atmosphere, and polished micro-interactions matching the members page gold standard.

### Concrete Deliverables
- `src/app/globals.css` — font system updated, Chakra Petch imported
- `src/components/ui/page-header.tsx` — reusable PageHeader component
- `src/components/ui/skeleton.tsx` — SkeletonLoader component
- `src/components/ui/tactical-card.tsx` — Card + CornerBrackets + noise wrapper
- `src/components/sidebar.tsx` — polished with accent bar, glow, dividers, online dot
- `src/components/topbar.tsx` — keyboard hint, breadcrumb, dynamic badge
- 9 page files updated with PageHeader + tactical atmosphere
- 4 list pages (organizations, investigations, operations, activity) converted to master-detail
- Mobile drawer + mobile search in sidebar/topbar
- All animations respect prefers-reduced-motion

### Definition of Done
- [ ] `npx tsc --noEmit` passes with zero errors
- [ ] `npm run build` succeeds
- [ ] Production deploy at giu-portal.vercel.app has zero runtime errors
- [ ] All 9 pages have PageHeader component
- [ ] All Card usages have CornerBrackets
- [ ] All animations respect prefers-reduced-motion
- [ ] Mobile layout works at 375px width

### Must Have
- Chakra Petch font for display/headlines
- IBM Plex Sans for body text
- PageHeader on all 9 pages
- CornerBrackets on all Card components
- Skeleton loaders on all data-fetching pages
- Master-detail layout on organizations, investigations, operations
- Mobile sidebar drawer
- prefers-reduced-motion on all new animations

### Must NOT Have (Guardrails)
- NO functional changes to CRUD, auth, routing, API routes
- NO new npm dependencies
- NO `as any` or `@ts-ignore`
- NO changes to Supabase queries or types
- NO changes to color system (gold primary #e6c383 stays)
- NO excessive comments or over-abstraction
- NO changes to data layer (queries, mutations, stores)
- NO scope creep into new features
- NO changes to the map page's canvas rendering logic
- NO breaking the existing Sheet panel in organizations (keep as fallback)

---

## Verification Strategy (MANDATORY)

> **ZERO HUMAN INTERVENTION** - ALL verification is agent-executed. No exceptions.

### Test Decision
- **Infrastructure exists**: NO (no test framework in package.json)
- **Automated tests**: NO
- **Framework**: none
- **Agent-Executed QA**: ALWAYS (mandatory for all tasks)

### QA Policy
Every task MUST include agent-executed QA scenarios.
Evidence saved to `.sisyphus/evidence/task-{N}-{scenario-slug}.{ext}`.

- **Frontend/UI**: Use Bash (curl) to fetch page HTML, assert key elements present
- **Build verification**: Use Bash to run tsc + build, assert exit code 0
- **Visual**: Use Bash to check CSS classes present in compiled output
- **Typecheck**: Use Bash to run tsc --noEmit, assert no errors

---

## Execution Strategy

### Parallel Execution Waves

```
Wave 1 (Foundation — start immediately):
├── T1: Font system replacement [quick]
├── T2: PageHeader component [quick]
├── T3: SkeletonLoader component [quick]
├── T4: TacticalCard wrapper [quick]
├── T5: Sidebar polish [quick]
└── T6: Topbar polish [quick]

Wave 2 (Apply to pages — after Wave 1, MAX PARALLEL):
├── T7: Dashboard hero + tactical (depends: 2, 4) [visual-engineering]
├── T8: Organizations master-detail (depends: 2, 3, 4) [unspecified-high]
├── T9: Investigations master-detail (depends: 2, 3, 4) [unspecified-high]
├── T10: Operations master-detail + search (depends: 2, 3, 4) [unspecified-high]
├── T11: Activity tactical + search (depends: 2, 3, 4) [quick]
├── T12: Settings tactical (depends: 2, 4) [quick]
├── T13: Map page tactical (depends: 2, 4) [quick]
└── T14: Markers page tactical (depends: 2, 4) [quick]

Wave 3 (Mobile + polish — after Wave 2):
├── T15: Mobile sidebar drawer (depends: 5) [visual-engineering]
├── T16: Mobile topbar search (depends: 6) [quick]
├── T17: Max-width standardization (depends: 7-14) [quick]
└── T18: Filter consistency pass (depends: 8-11) [quick]

Wave FINAL (After ALL tasks — 4 parallel reviews):
├── F1: Plan compliance audit (oracle)
├── F2: Code quality review (unspecified-high)
├── F3: Real manual QA (unspecified-high)
└── F4: Scope fidelity check (deep)
-> Present results -> Get explicit user okay

Critical Path: T1 → T2 → T7 → T15 → F1-F4 → user okay
Parallel Speedup: ~65% faster than sequential
Max Concurrent: 8 (Wave 2)
```

### Dependency Matrix

| Task | Depends On | Blocks |
|------|-----------|--------|
| T1 | - | T7-T14 (font applies) |
| T2 | - | T7-T14 (PageHeader) |
| T3 | - | T7-T14 (skeleton) |
| T4 | - | T7-T14 (TacticalCard) |
| T5 | - | T15 |
| T6 | - | T16 |
| T7 | T2, T4 | T17 |
| T8 | T2, T3, T4 | T17, T18 |
| T9 | T2, T3, T4 | T17, T18 |
| T10 | T2, T3, T4 | T17, T18 |
| T11 | T2, T3, T4 | T17, T18 |
| T12 | T2, T4 | T17 |
| T13 | T2, T4 | T17 |
| T14 | T2, T4 | T17 |
| T15 | T5 | - |
| T16 | T6 | - |
| T17 | T7-T14 | - |
| T18 | T8-T11 | - |

### Agent Dispatch Summary

- **Wave 1**: 6 tasks — T1-T6 → `quick`
- **Wave 2**: 8 tasks — T7 → `visual-engineering`, T8-T10 → `unspecified-high`, T11-T14 → `quick`
- **Wave 3**: 4 tasks — T15 → `visual-engineering`, T16-T18 → `quick`
- **FINAL**: 4 tasks — F1 → `oracle`, F2 → `unspecified-high`, F3 → `unspecified-high`, F4 → `deep`

---

## TODOs

- [ ] 1. Font System Replacement

  **What to do**:
  - Replace `Inter` import with `Chakra Petch` in globals.css Google Fonts import
  - Update `@theme` block: `--font-headline-md`, `--font-headline-lg`, `--font-display-lg` → `'Chakra Petch', sans-serif`
  - Update `--font-body-md` → `'IBM Plex Sans', sans-serif` (already imported, just not used for body)
  - Keep `IBM Plex Mono` for data-mono and label-caps
  - Verify all existing font-weight references still valid (Chakra Petch supports 300-700)

  **Must NOT do**:
  - Do NOT change color variables
  - Do NOT remove IBM Plex Sans or IBM Plex Mono imports
  - Do NOT change any component code — only globals.css

  **Recommended Agent Profile**:
  - **Category**: `quick`
  - **Skills**: []

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 1 (with T2-T6)
  - **Blocks**: T7-T14 (font must be set before pages use it)
  - **Blocked By**: None

  **References**:
  - `src/app/globals.css:1` — Google Fonts import line, add Chakra Petch here
  - `src/app/globals.css:38-43` — @theme font variables to update
  - `src/app/globals.css:144` — body font-family reference

  **Acceptance Criteria**:
  - [ ] `./node_modules/.bin/tsc --noEmit` passes
  - [ ] `npm run build` succeeds
  - [ ] globals.css imports Chakra Petch
  - [ ] @theme uses Chakra Petch for headlines, IBM Plex Sans for body

  **QA Scenarios**:
  ```
  Scenario: Font system compiles
    Tool: Bash
    Steps:
      1. Run `./node_modules/.bin/tsc --noEmit`
      2. Run `npm run build`
      3. Grep globals.css for "Chakra+Petch" in import URL
    Expected Result: tsc no output, build success, grep finds Chakra+Petch
    Evidence: .sisyphus/evidence/task-1-font-compile.txt

  Scenario: Body font is IBM Plex Sans
    Tool: Bash
    Steps:
      1. Read src/app/globals.css
      2. Assert --font-body-md value contains "IBM Plex Sans"
    Expected Result: --font-body-md = "'IBM Plex Sans', sans-serif"
    Evidence: .sisyphus/evidence/task-1-body-font.txt
  ```

  **Commit**: YES (groups with Wave 1)
  - Message: `feat(ui): font system - Chakra Petch display + IBM Plex Sans body`

- [ ] 2. PageHeader Component

  **What to do**:
  - Create `src/components/ui/page-header.tsx`
  - Props: `label` (mono uppercase), `title` (display font), `description?` (body), `actions?` (ReactNode for buttons), `icon?` (LucideIcon)
  - Structure: icon badge (w-10 h-10, primary border) + label (font-data-mono, text-on-surface-muted, tracking-widest) + title (font-display-lg) + optional description
  - Actions slot on right side (flex justify-between)
  - Animate with staggered fade-slide-up (opacity-0 + animate-fade-slide-up)
  - Export from `src/components/ui/index.ts` barrel if exists, or direct import

  **Must NOT do**:
  - Do NOT make it overly complex — simple presentational component
  - Do NOT add motion library dependency — use CSS animation classes

  **Recommended Agent Profile**:
  - **Category**: `quick`
  - **Skills**: []

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 1 (with T1, T3-T6)
  - **Blocks**: T7-T14 (all pages use PageHeader)
  - **Blocked By**: None

  **References**:
  - `src/app/(app)/dashboard/page.tsx:123-134` — existing header pattern to extract
  - `src/app/(app)/members/page.tsx:96-114` — members page header (gold standard)
  - `src/components/ui/card.tsx` — component structure pattern to follow

  **Acceptance Criteria**:
  - [ ] `./node_modules/.bin/tsc --noEmit` passes
  - [ ] Component file exists at `src/components/ui/page-header.tsx`
  - [ ] Component accepts label, title, description, actions, icon props

  **QA Scenarios**:
  ```
  Scenario: Component compiles
    Tool: Bash
    Steps:
      1. Run `./node_modules/.bin/tsc --noEmit`
    Expected Result: No errors
    Evidence: .sisyphus/evidence/task-2-pageheader-compile.txt

  Scenario: Component structure correct
    Tool: Bash
    Steps:
      1. Read src/components/ui/page-header.tsx
      2. Verify it exports PageHeader function
      3. Verify props interface has: label, title, description?, actions?, icon?
    Expected Result: All props present in interface
    Evidence: .sisyphus/evidence/task-2-pageheader-structure.txt
  ```

  **Commit**: YES (groups with Wave 1)
  - Message: `feat(ui): add reusable PageHeader component`

- [ ] 3. SkeletonLoader Component

  **What to do**:
  - Create `src/components/ui/skeleton.tsx`
  - Export `Skeleton` (base), `SkeletonCard` (card-shaped), `SkeletonList` (list of items), `SkeletonText` (text lines)
  - Use CSS `animate-pulse` + bg-surface-elevated/40
  - SkeletonCard: match Card dimensions (rounded-xl, p-gutter-md, h-32)
  - SkeletonList: array of SkeletonCard with stagger delay
  - Add subtle scanline overlay for tactical feel

  **Must NOT do**:
  - Do NOT use motion library — CSS only for performance
  - Do NOT add fake data shapes — pure visual placeholder

  **Recommended Agent Profile**:
  - **Category**: `quick`
  - **Skills**: []

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 1
  - **Blocks**: T7-T14 (pages use skeletons)
  - **Blocked By**: None

  **References**:
  - `src/app/(app)/members/page.tsx:152-168` — existing loading pattern (animated loader)
  - `src/components/ui/card.tsx` — Card dimensions to match
  - `src/app/globals.css:234` — noise-overlay class for tactical feel

  **Acceptance Criteria**:
  - [ ] Component file exists at `src/components/ui/skeleton.tsx`
  - [ ] Exports Skeleton, SkeletonCard, SkeletonList, SkeletonText

  **QA Scenarios**:
  ```
  Scenario: Component compiles
    Tool: Bash
    Steps:
      1. Run `./node_modules/.bin/tsc --noEmit`
    Expected Result: No errors
    Evidence: .sisyphus/evidence/task-3-skeleton-compile.txt
  ```

  **Commit**: YES (groups with Wave 1)

- [ ] 4. TacticalCard Wrapper

  **What to do**:
  - Create `src/components/ui/tactical-card.tsx`
  - Wrap existing Card with CornerBrackets + subtle noise overlay
  - Props: pass through all Card props + `accent?` (color for brackets)
  - Default accent: var(--color-primary)
  - Structure: `<Card {...props} className="relative overflow-hidden"><CornerBrackets size={10} className="opacity-30" />{children}</Card>`
  - This lets all pages get tactical atmosphere by swapping `<Card>` → `<TacticalCard>`

  **Must NOT do**:
  - Do NOT modify the existing Card component
  - Do NOT add heavy effects — keep it subtle

  **Recommended Agent Profile**:
  - **Category**: `quick`
  - **Skills**: []

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 1
  - **Blocks**: T7-T14
  - **Blocked By**: None

  **References**:
  - `src/components/ui/card.tsx` — Card to wrap
  - `src/components/tactical.tsx:5-28` — CornerBrackets component
  - `src/app/(app)/dashboard/page.tsx:178-179` — existing CornerBrackets usage pattern

  **Acceptance Criteria**:
  - [ ] Component file exists at `src/components/ui/tactical-card.tsx`
  - [ ] Wraps Card with CornerBrackets

  **QA Scenarios**:
  ```
  Scenario: Component compiles
    Tool: Bash
    Steps:
      1. Run `./node_modules/.bin/tsc --noEmit`
    Expected Result: No errors
    Evidence: .sisyphus/evidence/task-4-tacticalcard-compile.txt
  ```

  **Commit**: YES (groups with Wave 1)

- [ ] 5. Sidebar Polish

  **What to do**:
  - Active indicator: replace `border-r-2 border-primary` with left accent bar (w-1 h-full bg-primary) + subtle glow (`box-shadow: 0 0 15px color-mix(...)`)
  - Add section dividers in NAV_ITEMS — group: INTELIJEN (dashboard, map, markers), TARGET (organizations, members), OPERASI (investigations, operations, activity), SISTEM (settings)
  - Add small section label headers (font-data-mono text-[9px] text-on-surface-muted/30 tracking-widest uppercase) before first item of each group
  - Add online status dot (w-2 h-2 bg-status-active rounded-full) on user avatar with pulse animation
  - Add subtle scan line on hover for nav items

  **Must NOT do**:
  - Do NOT change NAV_ITEMS structure in constants.ts — grouping is visual only, computed in sidebar.tsx
  - Do NOT change collapse behavior
  - Do NOT remove existing animations

  **Recommended Agent Profile**:
  - **Category**: `quick`
  - **Skills**: []

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 1
  - **Blocks**: T15 (mobile drawer builds on sidebar)
  - **Blocked By**: None

  **References**:
  - `src/components/sidebar.tsx:60-84` — nav items list to add section dividers
  - `src/components/sidebar.tsx:86-97` — user avatar section for online dot
  - `src/lib/constants.ts:70-80` — NAV_ITEMS array (do NOT modify)
  - `src/app/globals.css:100-103` — pulse-ring keyframe for online dot

  **Acceptance Criteria**:
  - [ ] Active nav item has left accent bar (not border-r-2)
  - [ ] Section dividers visible when sidebar expanded
  - [ ] Online dot on avatar with pulse animation
  - [ ] `./node_modules/.bin/tsc --noEmit` passes

  **QA Scenarios**:
  ```
  Scenario: Sidebar structure
    Tool: Bash
    Steps:
      1. Read src/components/sidebar.tsx
      2. Verify section grouping logic exists
      3. Verify online dot element exists
    Expected Result: Section groups defined, online dot present
    Evidence: .sisyphus/evidence/task-5-sidebar-structure.txt

  Scenario: Build passes
    Tool: Bash
    Steps:
      1. Run `npm run build`
    Expected Result: Build succeeds
    Evidence: .sisyphus/evidence/task-5-sidebar-build.txt
  ```

  **Commit**: YES (groups with Wave 1)

- [ ] 6. Topbar Polish

  **What to do**:
  - Add keyboard shortcut hint to search input: append `<kbd>` element showing "/" with styling (font-data-mono text-[10px] bg-surface-elevated border rounded px-1.5 py-0.5)
  - Remove hardcoded "3" badge on bell — replace with dynamic notification count from useActivity (count unread) or hide if 0
  - Add breadcrumb context: show parent section label above title (e.g., "INTELIJEN > Dasbor") using NAV_ITEMS grouping
  - Add subtle bottom border glow on active state

  **Must NOT do**:
  - Do NOT implement actual keyboard shortcut functionality — visual hint only
  - Do NOT add new API calls for notifications — use existing useActivity hook
  - Do NOT change topbar height (already fixed to h-16)

  **Recommended Agent Profile**:
  - **Category**: `quick`
  - **Skills**: []

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 1
  - **Blocks**: T16 (mobile search builds on topbar)
  - **Blocked By**: None

  **References**:
  - `src/components/topbar.tsx:62-76` — search and bell section to modify
  - `src/components/topbar.tsx:50-60` — title section for breadcrumb
  - `src/lib/queries.ts` — useActivity hook for notification count (find it first)
  - `src/lib/constants.ts:70-80` — NAV_ITEMS for breadcrumb grouping

  **Acceptance Criteria**:
  - [ ] Search input has "/" keyboard hint
  - [ ] Bell badge is dynamic (not hardcoded "3")
  - [ ] Breadcrumb shows section label
  - [ ] `./node_modules/.bin/tsc --noEmit` passes

  **QA Scenarios**:
  ```
  Scenario: Topbar structure
    Tool: Bash
    Steps:
      1. Read src/components/topbar.tsx
      2. Verify kbd element exists
      3. Verify hardcoded "3" is replaced with dynamic count
    Expected Result: kbd present, no hardcoded "3"
    Evidence: .sisyphus/evidence/task-6-topbar-structure.txt
  ```

  **Commit**: YES (groups with Wave 1)

--- (MANDATORY — after ALL implementation tasks)

> 4 review agents run in PARALLEL. ALL must APPROVE. Present consolidated results to user and get explicit "okay" before completing.

### Wave 2: Apply Foundation to Pages

- [ ] 7. Dashboard Hero + Tactical Atmosphere

  **What to do**:
  - Replace inline header with `<PageHeader>` component (T2)
  - Swap all `<Card>` → `<TacticalCard>` (T4)
  - Add skeleton loaders for initial data fetch (T3)
  - Hero section: add large tactical graphic (radial gradient + grid pattern behind title)
  - Add noise-overlay class to page container
  - Add prefers-reduced-motion guards to all animations

  **Must NOT do**:
  - Do NOT change data queries or stats logic
  - Do NOT remove existing functionality (links, buttons, threat donut)

  **Recommended Agent Profile**:
  - **Category**: `visual-engineering`
  - **Skills**: [`frontend-ui-ux`]

  **Parallelization**: Wave 2 | Blocks: T17 | Blocked By: T2, T4

  **References**:
  - `src/app/(app)/dashboard/page.tsx:107-134` — header to replace
  - `src/app/(app)/members/page.tsx:57-70` — grid pattern (gold standard)
  - `src/components/ui/page-header.tsx` — PageHeader (T2)
  - `src/components/ui/tactical-card.tsx` — TacticalCard (T4)

  **Acceptance Criteria**:
  - [ ] PageHeader used
  - [ ] All Card → TacticalCard
  - [ ] Skeleton loaders during isLoading
  - [ ] Grid pattern background present
  - [ ] `./node_modules/.bin/tsc --noEmit` passes

  **QA Scenarios**:
  ```
  Scenario: Dashboard compiles
    Tool: Bash
    Steps:
      1. Run `./node_modules/.bin/tsc --noEmit`
      2. Run `npm run build`
    Expected Result: Both pass
    Evidence: .sisyphus/evidence/task-7-dashboard-build.txt

  Scenario: PageHeader used
    Tool: Bash
    Steps:
      1. Grep "PageHeader" in src/app/(app)/dashboard/page.tsx
    Expected Result: Import + usage found
    Evidence: .sisyphus/evidence/task-7-pageheader.txt
  ```

  **Commit**: YES (groups with Wave 2)

- [ ] 8. Organizations — Master-Detail Layout

  **What to do**:
  - Replace inline header with `<PageHeader>`
  - Convert list+Sheet to master-detail split (like members page)
  - Left: search + filter + org list (w-80)
  - Right: selected org detail with CornerBrackets, tactical styling
  - Keep Sheet as mobile fallback
  - Add skeleton loaders + TacticalCard + noise/grid bg

  **Must NOT do**:
  - Do NOT change CRUD logic
  - Do NOT remove Sheet (keep as mobile fallback)

  **Recommended Agent Profile**:
  - **Category**: `unspecified-high`
  - **Skills**: [`frontend-ui-ux`]

  **Parallelization**: Wave 2 | Blocks: T17, T18 | Blocked By: T2, T3, T4

  **References**:
  - `src/app/(app)/members/page.tsx:176-204` — master-detail pattern
  - `src/app/(app)/organizations/page.tsx` — current page
  - `src/components/ui/sheet.tsx` — Sheet (keep as mobile fallback)

  **Acceptance Criteria**:
  - [ ] Master-detail split layout
  - [ ] PageHeader + TacticalCard + skeletons
  - [ ] `./node_modules/.bin/tsc --noEmit` passes

  **QA Scenarios**:
  ```
  Scenario: Build passes
    Tool: Bash
    Steps:
      1. Run `npm run build`
    Expected Result: Build succeeds
    Evidence: .sisyphus/evidence/task-8-orgs-build.txt

  Scenario: Split layout
    Tool: Bash
    Steps:
      1. Grep "flex" + "w-80" in organizations/page.tsx
    Expected Result: Split layout classes present
    Evidence: .sisyphus/evidence/task-8-orgs-structure.txt
  ```

  **Commit**: YES (groups with Wave 2)

- [ ] 9. Investigations — Master-Detail Layout

  **What to do**:
  - Same as T8: PageHeader + master-detail + TacticalCard + skeletons + noise/grid
  - Left: search + status filter + case list
  - Right: selected investigation detail with evidence, timeline

  **Must NOT do**:
  - Do NOT change investigation CRUD logic

  **Recommended Agent Profile**:
  - **Category**: `unspecified-high`
  - **Skills**: [`frontend-ui-ux`]

  **Parallelization**: Wave 2 | Blocks: T17, T18 | Blocked By: T2, T3, T4

  **References**:
  - `src/app/(app)/investigations/page.tsx` — current page
  - `src/app/(app)/members/page.tsx:176-204` — master-detail pattern
  - `src/lib/constants.ts:48-55` — INVESTIGATION_STATUS_META

  **Acceptance Criteria**:
  - [ ] Master-detail layout
  - [ ] PageHeader + TacticalCard + skeletons
  - [ ] `./node_modules/.bin/tsc --noEmit` passes

  **QA Scenarios**:
  ```
  Scenario: Build passes
    Tool: Bash
    Steps:
      1. Run `npm run build`
    Expected Result: Build succeeds
    Evidence: .sisyphus/evidence/task-9-investigations-build.txt
  ```

  **Commit**: YES (groups with Wave 2)

- [ ] 10. Operations — Master-Detail + Search

  **What to do**:
  - Same as T8/T9: PageHeader + master-detail + TacticalCard + skeletons
  - ADD search input (currently missing — only has status filter)
  - Left: search + status filter + operation list
  - Right: selected operation detail

  **Must NOT do**:
  - Do NOT change operation CRUD logic

  **Recommended Agent Profile**:
  - **Category**: `unspecified-high`
  - **Skills**: [`frontend-ui-ux`]

  **Parallelization**: Wave 2 | Blocks: T17, T18 | Blocked By: T2, T3, T4

  **References**:
  - `src/app/(app)/operations/page.tsx` — current page (no search)
  - `src/app/(app)/investigations/page.tsx:26-32` — search pattern to copy
  - `src/lib/constants.ts:60-68` — OPERATION_STATUS_META

  **Acceptance Criteria**:
  - [ ] Master-detail layout
  - [ ] Search input added
  - [ ] PageHeader + TacticalCard + skeletons
  - [ ] `./node_modules/.bin/tsc --noEmit` passes

  **QA Scenarios**:
  ```
  Scenario: Search added
    Tool: Bash
    Steps:
      1. Grep "search" + "useState" in operations/page.tsx
    Expected Result: Search state + input present
    Evidence: .sisyphus/evidence/task-10-operations-search.txt
  ```

  **Commit**: YES (groups with Wave 2)

- [ ] 11. Activity — Tactical + Search

  **What to do**:
  - Replace inline header with `<PageHeader>`
  - Swap Card → TacticalCard
  - ADD search input (filter by message/actor text)
  - Add skeleton loaders
  - Add noise/grid bg
  - Keep grouped-by-day timeline structure

  **Must NOT do**:
  - Do NOT change activity query or grouping logic

  **Recommended Agent Profile**:
  - **Category**: `quick`
  - **Skills**: [`frontend-ui-ux`]

  **Parallelization**: Wave 2 | Blocks: T17, T18 | Blocked By: T2, T3, T4

  **References**:
  - `src/app/(app)/activity/page.tsx` — current page
  - `src/lib/constants.ts:13-24` — TYPE_META for activity types

  **Acceptance Criteria**:
  - [ ] PageHeader + TacticalCard + skeletons
  - [ ] Search input added
  - [ ] `./node_modules/.bin/tsc --noEmit` passes

  **QA Scenarios**:
  ```
  Scenario: Build passes
    Tool: Bash
    Steps:
      1. Run `npm run build`
    Expected Result: Build succeeds
    Evidence: .sisyphus/evidence/task-11-activity-build.txt
  ```

  **Commit**: YES (groups with Wave 2)

- [ ] 12. Settings — Tactical Polish

  **What to do**:
  - Replace inline header with `<PageHeader>`
  - Swap Card → TacticalCard
  - Add noise/grid bg
  - Keep max-w-3xl (content-focused page)
  - Add prefers-reduced-motion to existing animations

  **Must NOT do**:
  - Do NOT change settings form logic
  - Do NOT change mockStore/signOut handlers

  **Recommended Agent Profile**:
  - **Category**: `quick`
  - **Skills**: []

  **Parallelization**: Wave 2 | Blocks: T17 | Blocked By: T2, T4

  **References**:
  - `src/app/(app)/settings/page.tsx` — current page
  - `src/components/ui/page-header.tsx` — PageHeader

  **Acceptance Criteria**:
  - [ ] PageHeader + TacticalCard
  - [ ] `./node_modules/.bin/tsc --noEmit` passes

  **QA Scenarios**:
  ```
  Scenario: Build passes
    Tool: Bash
    Steps:
      1. Run `npm run build`
    Expected Result: Build succeeds
    Evidence: .sisyphus/evidence/task-12-settings-build.txt
  ```

  **Commit**: YES (groups with Wave 2)

- [ ] 13. Map Page — Tactical Header

  **What to do**:
  - Replace inline header with `<PageHeader>`
  - Add noise/grid bg around map container
  - Add CornerBrackets to map container border
  - Do NOT overlay tactical effects on the map canvas itself

  **Must NOT do**:
  - Do NOT modify the map canvas rendering logic
  - Do NOT add overlays that interfere with map interactions

  **Recommended Agent Profile**:
  - **Category**: `quick`
  - **Skills**: []

  **Parallelization**: Wave 2 | Blocks: T17 | Blocked By: T2, T4

  **References**:
  - `src/app/(app)/map/page.tsx` — current page
  - `src/app/(app)/map/intelligence-map.tsx` — map component (do NOT modify)

  **Acceptance Criteria**:
  - [ ] PageHeader used
  - [ ] Map container has CornerBrackets
  - [ ] `./node_modules/.bin/tsc --noEmit` passes

  **QA Scenarios**:
  ```
  Scenario: Build passes
    Tool: Bash
    Steps:
      1. Run `npm run build`
    Expected Result: Build succeeds
    Evidence: .sisyphus/evidence/task-13-map-build.txt
  ```

  **Commit**: YES (groups with Wave 2)

- [ ] 14. Markers Page — Tactical Polish

  **What to do**:
  - Replace inline header with `<PageHeader>`
  - Swap Card → TacticalCard
  - Add skeleton loaders
  - Add noise/grid bg

  **Must NOT do**:
  - Do NOT change marker CRUD logic

  **Recommended Agent Profile**:
  - **Category**: `quick`
  - **Skills**: []

  **Parallelization**: Wave 2 | Blocks: T17 | Blocked By: T2, T4

  **References**:
  - `src/app/(app)/markers/page.tsx` — current page

  **Acceptance Criteria**:
  - [ ] PageHeader + TacticalCard + skeletons
  - [ ] `./node_modules/.bin/tsc --noEmit` passes

  **QA Scenarios**:
  ```
  Scenario: Build passes
    Tool: Bash
    Steps:
      1. Run `npm run build`
    Expected Result: Build succeeds
    Evidence: .sisyphus/evidence/task-14-markers-build.txt
  ```

  **Commit**: YES (groups with Wave 2)

---

### Wave 3: Mobile + Polish

- [ ] 15. Mobile Sidebar Drawer

  **What to do**:
  - Add mobile breakpoint detection (use existing useUIStore or add isMobile state)
  - On mobile (< md): sidebar becomes overlay drawer (fixed, full height, z-50)
  - Add backdrop overlay (bg-black/50 backdrop-blur-sm) when drawer open
  - Add hamburger toggle on topbar (already exists — Menu button)
  - Close drawer on nav click
  - Desktop (md+): keep current fixed sidebar behavior

  **Must NOT do**:
  - Do NOT change desktop sidebar behavior
  - Do NOT add new dependencies

  **Recommended Agent Profile**:
  - **Category**: `visual-engineering`
  - **Skills**: [`frontend-ui-ux`]

  **Parallelization**: Wave 3 | Blocks: none | Blocked By: T5

  **References**:
  - `src/components/sidebar.tsx` — current sidebar
  - `src/components/app-shell.tsx` — layout wrapper
  - `src/stores/ui.ts` — useUIStore (sidebarCollapsed state)
  - `src/components/topbar.tsx:46-48` — Menu button (already exists)

  **Acceptance Criteria**:
  - [ ] Mobile drawer works at 375px width
  - [ ] Backdrop closes drawer on click
  - [ ] Nav click closes drawer on mobile
  - [ ] Desktop sidebar unchanged
  - [ ] `./node_modules/.bin/tsc --noEmit` passes

  **QA Scenarios**:
  ```
  Scenario: Build passes
    Tool: Bash
    Steps:
      1. Run `npm run build`
    Expected Result: Build succeeds
    Evidence: .sisyphus/evidence/task-15-mobile-drawer-build.txt

  Scenario: Drawer structure
    Tool: Bash
    Steps:
      1. Grep "fixed" + "z-50" + "backdrop" in sidebar.tsx
    Expected Result: Drawer overlay classes present
    Evidence: .sisyphus/evidence/task-15-drawer-structure.txt
  ```

  **Commit**: YES (groups with Wave 3)

- [ ] 16. Mobile Topbar Search

  **What to do**:
  - On mobile: replace hidden search input with search icon button
  - Clicking icon opens full-width search overlay (fixed top, bg-surface-graphite, z-50)
  - Add close button (X) to overlay
  - ESC key closes overlay
  - Desktop: keep current inline search

  **Must NOT do**:
  - Do NOT change desktop search

  **Recommended Agent Profile**:
  - **Category**: `quick`
  - **Skills**: []

  **Parallelization**: Wave 3 | Blocks: none | Blocked By: T6

  **References**:
  - `src/components/topbar.tsx:62-66` — current search (hidden md:flex)
  - `src/components/ui/dialog.tsx` — Dialog pattern for overlay

  **Acceptance Criteria**:
  - [ ] Mobile search overlay works
  - [ ] ESC closes overlay
  - [ ] Desktop search unchanged
  - [ ] `./node_modules/.bin/tsc --noEmit` passes

  **QA Scenarios**:
  ```
  Scenario: Build passes
    Tool: Bash
    Steps:
      1. Run `npm run build`
    Expected Result: Build succeeds
    Evidence: .sisyphus/evidence/task-16-mobile-search-build.txt
  ```

  **Commit**: YES (groups with Wave 3)

- [ ] 17. Max-Width Standardization

  **What to do**:
  - Data-heavy pages (dashboard, organizations, investigations, operations, markers): `max-w-[1600px]`
  - Content-focused pages (activity, settings): `max-w-[1200px]`
  - Map page: `max-w-[1400px]` (custom — map needs width)
  - Members page: already `max-w-[1600px]` (keep)
  - Verify all pages use `mx-auto` for centering

  **Must NOT do**:
  - Do NOT change page content — only container max-width

  **Recommended Agent Profile**:
  - **Category**: `quick`
  - **Skills**: []

  **Parallelization**: Wave 3 | Blocks: none | Blocked By: T7-T14

  **References**:
  - `src/app/(app)/dashboard/page.tsx:108` — current max-w-[1600px]
  - `src/app/(app)/activity/page.tsx:45` — current max-w-[1200px]
  - `src/app/(app)/settings/page.tsx:43` — current max-w-3xl

  **Acceptance Criteria**:
  - [ ] All pages have consistent max-width per type
  - [ ] `./node_modules/.bin/tsc --noEmit` passes

  **QA Scenarios**:
  ```
  Scenario: Consistency check
    Tool: Bash
    Steps:
      1. Grep "max-w-" across all (app) page files
    Expected Result: Data pages 1600px, content pages 1200px, map 1400px
    Evidence: .sisyphus/evidence/task-17-maxwidth.txt
  ```

  **Commit**: YES (groups with Wave 3)

- [ ] 18. Filter Consistency Pass

  **What to do**:
  - Verify all list pages have search + filter:
    - Organizations: search + threat filter ✅ (already has)
    - Investigations: search + status filter ✅ (already has)
    - Operations: ADD search (done in T10) + status filter ✅
    - Activity: ADD search (done in T11) + type filter ✅
    - Markers: verify search + type filter exists
  - Standardize filter bar styling: use consistent layout (search left, select right, gap-3)

  **Must NOT do**:
  - Do NOT change filter logic

  **Recommended Agent Profile**:
  - **Category**: `quick`
  - **Skills**: []

  **Parallelization**: Wave 3 | Blocks: none | Blocked By: T8-T11

  **References**:
  - `src/app/(app)/organizations/page.tsx` — filter pattern reference
  - `src/app/(app)/investigations/page.tsx` — filter pattern reference

  **Acceptance Criteria**:
  - [ ] All list pages have search + filter
  - [ ] Filter bar styling consistent
  - [ ] `./node_modules/.bin/tsc --noEmit` passes

  **QA Scenarios**:
  ```
  Scenario: Consistency check
    Tool: Bash
    Steps:
      1. Grep "search" + "Select" in all list pages
    Expected Result: All list pages have both
    Evidence: .sisyphus/evidence/task-18-filter-consistency.txt
  ```

  **Commit**: YES (groups with Wave 3)

---

## Final Verification Wave (MANDATORY — after ALL implementation tasks)

- [ ] F1. **Plan Compliance Audit** — `oracle`
  Read the plan end-to-end. For each "Must Have": verify implementation exists (read file, curl endpoint, run command). For each "Must NOT Have": search codebase for forbidden patterns — reject with file:line if found. Check evidence files exist in .sisyphus/evidence/. Compare deliverables against plan.
  Output: `Must Have [N/N] | Must NOT Have [N/N] | Tasks [N/N] | VERDICT: APPROVE/REJECT`

- [ ] F2. **Code Quality Review** — `unspecified-high`
  Run `tsc --noEmit` + linter + `npm run build`. Review all changed files for: `as any`/`@ts-ignore`, empty catches, console.log in prod, commented-out code, unused imports. Check AI slop: excessive comments, over-abstraction, generic names.
  Output: `Build [PASS/FAIL] | Lint [PASS/FAIL] | Tests [N pass/N fail] | Files [N clean/N issues] | VERDICT`

- [ ] F3. **Real Manual QA** — `unspecified-high`
  Start from clean state. Execute EVERY QA scenario from EVERY task. Test cross-page navigation. Test mobile breakpoint (375px). Test prefers-reduced-motion. Save screenshots to `.sisyphus/evidence/final-qa/`.
  Output: `Scenarios [N/N pass] | Integration [N/N] | Edge Cases [N tested] | VERDICT`

- [ ] F4. **Scope Fidelity Check** — `deep`
  For each task: read "What to do", read actual diff. Verify 1:1 — everything in spec was built, nothing beyond spec. Check "Must NOT do" compliance. Detect cross-task contamination. Flag unaccounted changes.
  Output: `Tasks [N/N compliant] | Contamination [CLEAN/N issues] | Unaccounted [CLEAN/N files] | VERDICT`

---

## Commit Strategy

- **Wave 1**: `feat(ui): font system + reusable components + sidebar/topbar polish`
- **Wave 2**: `feat(ui): tactical atmosphere + PageHeader on all pages + master-detail layouts`
- **Wave 3**: `feat(ui): mobile drawer + search + filter consistency + max-width`
- **Final**: `chore: verification evidence`

---

## Success Criteria

### Verification Commands
```bash
./node_modules/.bin/tsc --noEmit  # Expected: no output (success)
npm run build                     # Expected: ✓ Compiled successfully
```

### Final Checklist
- [ ] All "Must Have" present
- [ ] All "Must NOT Have" absent
- [ ] `npx tsc --noEmit` passes
- [ ] `npm run build` passes
- [ ] Production has zero runtime errors
- [ ] All 9 pages have PageHeader
- [ ] All Card usages have CornerBrackets
- [ ] Mobile layout works at 375px
