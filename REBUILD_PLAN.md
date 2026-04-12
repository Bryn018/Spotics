# Spotics Frontend Rebuild Plan

## Overview
Rebuild the frontend to match the Figma design exactly, keeping the existing backend data wiring intact. The design uses hardcoded mock data everywhere — we replace those with real API calls via existing hooks/contexts.

## Color Scheme Change (Design vs Current)
- **Design**: emerald/teal/green primary (`from-emerald-400 to-teal-400`, `text-green-400`)
- **Current**: purple/pink primary (`from-purple-400 to-pink-400`, `text-purple-400`)
- Action: adopt design colors throughout

## Phase 1: Dependencies
```bash
npm install motion html2canvas
```
- `motion` (framer-motion v11+) — used for animations throughout design
- `html2canvas` — used in Export page for screenshot export

## Phase 2: Header.tsx — Merge Design Styling + Real Data
Design (149 lines) vs Current (189 lines)

Changes:
- Replace purple gradient with emerald/teal: `from-emerald-400 to-teal-400`
- Active nav: green-400 (Dashboard), blue-400 (Analytics), rose-800 (Export)
- Add Export nav link (`/dashboard/export`)
- Add `motion.div` whileHover/whileTap on icon buttons
- Remove Search input (design doesn't have it)
- Remove ThemeToggle from header (design doesn't use it in header)
- Keep: real user data from `useSession()`, logout mutation, avatar with real initials
- Keep: NotificationsDialog, SettingsDialog, AccountDialog
- Keep: mobile Sheet menu (add Export link to it)

## Phase 3: Home.tsx — Replace Layout, Keep Data Wiring
Design (83 lines) vs Current (128 lines)

The design Home is just a layout shell — no loading/error states, no data fetching.
Current Home has loading/error/empty states + sync button.

Changes:
- Adopt design's grid layout exactly (WrappedSelector → TimeRange → StatsOverview → TopAlbums → 12-col grid with Tracks+Artists left, Activity right → ListeningChart + GenreDistribution)
- Keep loading/error/empty states from current (design doesn't have them but they're needed)
- Remove HeroSection import (design doesn't use it — uses WrappedSelector instead)
- Update section header styles: colored gradient bars + white text
- Replace purple with green/blue/rose gradients for section headers

## Phase 4: Analytics.tsx — Design Layout + Real Data
Design (690 lines, hardcoded) vs Current (557 lines, real data)

This is the biggest merge. Design has beautiful charts/layouts with mock data arrays.
Current wires to `useDashboardData()`.

Strategy:
- Take design's JSX layout and styling wholesale
- Replace every hardcoded data array with computed values from API response
- Map API `summary.payload` fields to chart data shapes
- Keep `useDashboardData()` + `useTimeRange()` hooks
- Add `motion` animations from design

Data mappings needed:
| Design Mock | API Source |
|---|---|
| monthlyData (12 months) | summary.payload.listeningHistory or compute from activities |
| hourlyData (24 hours) | summary.payload.hourlyDistribution or compute |
| musicTasteData (energy/dance/valence) | summary.payload.audioFeatures |
| genreEvolution | summary.payload.genreHistory or compute |
| topGenres | summary.payload.topGenres |
| streamingStats | summary.totals (minutes, tracks, artists) |

## Phase 5: Export.tsx — New Page (Design is Self-Contained)
Design (351 lines) — entirely new, doesn't exist in current codebase.

Features:
- Time range tabs: Weekly / Monthly / All Time
- Stats cards (hours, tracks, artists, top genre)
- Top tracks list, top artists list, genre breakdown
- "Export as Image" button using html2canvas
- Animated with motion/react

Data: Design uses hardcoded `dataByRange` object. We wire to real API:
- Use `useDashboardData()` to get summary for selected timeframe
- Map summary.payload to the card/list data shapes

## Phase 6: Login.tsx — Style Alignment
Design vs Current — likely minor differences in gradient colors and button styling.
- Update purple gradients to emerald/teal
- Match button/card styling from design

## Phase 7: Routes Update
Add Export route:
```tsx
{ path: "export", Component: Export }
```

## Phase 8: Component Updates
Several shared components may need color/animation updates:
- StatsOverview, TopTracks, TopArtists, TopAlbums — check for purple→green color changes
- ListeningChart, GenreDistribution — check chart color schemes  
- WrappedSelector — check styling
- TimeRangeSelector — check styling
- RecentActivity — check styling
- SpoticsLogo — check if design version differs

For each: diff design version vs current, apply design styling, keep real data wiring.

## Phase 9: Dialogs
- SettingsDialog, NotificationsDialog, AccountDialog — already exist in current
- ActivityDialog, DailyWrapDialog, WeeklyWrapDialog, YearlyWrapDialog — check if in current
- Compare styling, add motion animations from design

## Phase 10: Backend Changes
Likely minimal. Current API already serves:
- `/api/summaries?timeframe=X` → totals + payload (tracks, artists, genres, etc.)
- `/api/wraps?timeframe=X` → wrap reports
- `/api/me` → user profile

May need:
- Analytics-specific endpoint if hourly/monthly aggregations aren't in payload
- Export endpoint if we want server-side export (design uses client-side html2canvas)

## Phase 11: Test, Commit, Deploy
1. `npm run build` — verify no TS errors
2. Local dev test all 4 pages
3. Git commit + push to feature/fullstack-ready
4. Railway auto-deploys
5. Verify at spotics.insights.autos

## Execution Order
1. Install deps (motion, html2canvas)
2. Update Header (nav + colors + animations)
3. Update shared components (colors + animations)  
4. Update Home page layout
5. Rebuild Analytics page (biggest task)
6. Create Export page
7. Update Login page
8. Update routes
9. Build + test + deploy
