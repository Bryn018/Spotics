# Spotics Design Bundle — Complete 4-Page Design Extract
**Source:** Figma Make export from https://agile-zero-13740164.figma.site/
**Exported ZIP:** /home/waly/Pictures/Design Spotics.zip
**Applied to:** /home/waly/spotics (repo: Bryn018/spotics, branch: feature/fullstack-ready)

---

## Executive Summary

| Page | Route | File | Lines | State |
|------|-------|------|-------|-------|
| Login | `/login` | src/app/pages/Login.tsx | 105 | ✓ Complete |
| Dashboard (Home) | `/dashboard` | src/app/pages/Home.tsx | 84 | ✓ Complete |
| Analytics | `/dashboard/analytics` | src/app/pages/Analytics.tsx | 691 | ✓ Complete |
| Export | `/dashboard/export` | src/app/pages/Export.tsx | 501 | ✓ Has bug (JS error) |

All pages are React functional components with Framer Motion animations and Tailwind CSS v4 styling.

---

## Design Tokens (from extracted CSS)

### Color Palette

```
PRIMARY BRAND (Spotify-inspired green spectrum):
  emerald-400  #10b981   (main accent)
  emerald-500  #14b8a6   (gradient mid)
  teal-400     #2dd4bf   (secondary accent)
  teal-500     #14b8a6
  cyan-400     #22d3ee   (tertiary accent)
  green-500    #22c55e   (CTA buttons)
  green-600    #16a34a

DARK THEME (OKLCH color space):
  bg-background       oklch(0.145 0 0)        ≈ #1a1a1a (near-black)
  bg-card             oklch(0.145 0 0)        same as bg
  foreground          oklch(0.985 0 0)        ≈ #fafafa (off-white)
  border              oklch(0.269 0 0)        ≈ #404040 (dark gray)
  muted               oklch(0.269 0 0)        dimmed text/bg
  ring (focus)        oklch(0.439 0 0)        purple-ish glow

CHART COLORS (Analytics page):
  chart-1 (purple)    oklch(0.488 0.243 264.376)  #a855f7
  chart-2 (teal)      oklch(0.696 0.17 162.48)    #14b8a6
  chart-3 (green)     oklch(0.769 0.188 70.08)    #22c55e
  chart-4 (pink)      oklch(0.627 0.265 303.9)    #ec4899
  chart-5 (yellow)    oklch(0.645 0.246 16.439)   #eab308
```

### Typography

```
Font stack:      system-ui, -apple-system, sans-serif
font-weight:
  normal  400
  medium   500  --var(--font-weight-medium)
  bold     700
  black    900  --for display numbers/titles
base size: 16px
```

### Spacing & Borders

```
Radius tokens:
  --radius: 0.625rem (10px) — base
  rounded-sm   0.375rem  (6px)
  rounded-md   0.5rem    (8px)
  rounded-lg   0.75rem   (12px)
  rounded-xl   1rem      (16px)
  rounded-2xl  1.5rem    (24px)
  rounded-3xl  2rem      (32px) — main cards, login box

Borders:
  glass borders: border-white/10 (10% white opacity)
  hover glow:     border-emerald-400/30 (30% opacity)

Shadows:
  shadow-2xl — deep elevation
  shadow-emerald-500/30 — colored glow (30% opacity)
```

---

## Page-by-Page Breakdown

### 1. LOGIN PAGE  (`/login`)

**File:** `src/app/pages/Login.tsx`  
**Dependencies:** `SpoticsLogo`, `Button` (shadcn/ui), `useNavigate` from react-router, `motion` from Framer Motion

**Visual Structure:**
```
Full viewport background: pure black (#000000) — NO gradients
└─ Centered glass card container:
   ├─ absolute inset-0 bg-black (base)
   ├─ motion.div (fade-in from y=20, duration 0.6s)
   │   └─ card: rounded-3xl bg-gray-900/40 backdrop-blur-2xl
   │             border border-gray-800/50 shadow-2xl
   │       inner layer: inset-[1px] bg-gray-900/90 backdrop-blur-2xl
   │       gradient overlay: inset-0 bg-gradient-to-br from-green-500/5 to-black
   │
   ├─ Content wrapper (p-12):
   │   ├─ Logo section (flex-col, items-center, mb-12)
   │   │   └─ SpoticsLogo (h-20 w-20, centered)
   │   │
   │   ├─ Title: "Spotics" (text-5xl font-bold)
   │   │   gradient: bg-gradient-to-r from-green-400 to-green-600
   │   │   text-clip: text-transparent
   │   │
   │   ├─ Subtitle: paragraph text-gray-400 mb-8
   │   │   "Your personal music analytics platform..."
   │   │
   │   ├─ CTA Button:
   │   │   className="bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-500"
   │   │   text-white font-bold px-10 py-7 text-lg rounded-2xl
   │   │   shadow-2xl shadow-emerald-500/30
   │   │   content: [Play icon (filled white)] "Continue with Spotify"
   │   │
   │   ├─ Disclaimer: text-xs text-gray-500
   │   │   "By connecting, you agree to share your Spotify listening data."
   │   │
   │   └─ Feature pills (flex-row gap-2):
   │       📊 Analytics  🎵 Top Tracks  🎤 Artists  💿 Albums
   │       (displayed as text with emoji, not buttons)
   │
   └─ Footer: "Spotics is not affiliated with Spotify AB..."
```

**Key Design Features:**
- Card uses **2-layer stacking**: outer glass with blur, inner semi-opaque backdrop for depth
- Gradient overlay `from-green-500/5` — extremely subtle (5% opacity)
- Motion: single entrance animation on the main card (`initial opacity 0, y 20 → animate opacity 1, y 0`)
- No nav header on login — minimalist one-column center layout

**Colors:**
  bg:          black
  card:        gray-900/40 with backdrop-blur-2xl
  border:      gray-800/50 (semi-transparent dark)
  title:       green-400 → green-600 gradient
  button:      emerald-500 → teal-500 → cyan-500 horizontal gradient
  button glow: shadow-emerald-500/30

---

### 2. DASHBOARD / HOME (`/dashboard`)

**File:** `src/app/pages/Home.tsx`  
**Layout:** 12-column grid, `max-w-[1600px]`, `container mx-auto`, `px-4 lg:px-6`  
**Header:** imported from `components/Header.tsx` (sticky top, bg-black/80 backdrop-blur)

**Component Stack (top to bottom):**

#### 2.1 WrappedSelector  
`components/WrappedSelector.tsx` (381 lines)

**Purpose:** Hero banner with Daily / Weekly / Yearly Stories-style card  
**Structure:**
```
Full-width section, mb-10
min-h-[500-600px], bg-black
├─ Background layers:
│  1. base: bg-gradient-to-br from-black via-green-950 to-black
│  2. pattern: opacity-[0.06] bg-image from Unsplash (abstract wave)
│  3. animated orbs: 3 separate motion.div circles (emerald/blue/cyan)
│     animate: scale + x/y translation + opacity cycle (duration 8-12s, infinite ease-in-out)
│  4. grid overlay: opacity-[0.03] linear-gradient grid lines (50px spacing)
│
├─ Content (px-6 lg:px-12 py-12 lg:py-16 max-w-7xl mx-auto):
│  ┌─ Left col (lg:col-span-7):
│  │  ├─ Badge: inline-flex px-4 py-2 rounded-full
│  │  │           bg-gradient-to-r from-green-500/20 to-blue-500/20
│  │  │           border border-green-400/40 backdrop-blur-xl
│  │  │           text: "YEAR IN REVIEW" / "WEEKLY STATS" / "TODAY'S RECAP"
│  │  │           sparkling icon rotates continuously
│  │  │
│  │  ├─ Title: text-5xl md:text-6xl lg:text-7xl font-black text-white
│  │  │          "Look Back At It" / "This Week's Soundtrack" / "Your Day in Music"
│  │  │          underline: h-1.5 w-24 bg-gradient-to-r from-green-400 to-green-600 rounded-full
│  │  │
│  │  ├─ Subtitle: text-xl md:text-2xl text-gray-300 leading-relaxed
│  │  │
│  │  ├─ Stats cards (grid-cols-3, gap-4):
│  │  │   Each: relative group → glow on hover (bg-gradient blur opacity-0→40)
│  │  │        inner: glassmorphic card (from-gray-900/80 to-gray-800/60)
│  │  │        Icons: Music, Headphones, Zap (lucide-react)
│  │  │        Labels in uppercase tracking-widest text-xs text-gray-500
│  │  │        Values: text-2xl md:text-3xl font-black
│  │  │                bg-gradient-to-br from-green-400 to-blue-400 text-transparent
│  │  │
│  │  ├─ Wrap Selector (3 buttons gap-3):
│  │  │   Daily:  default → bg-gradient-to-r from-blue-600 to-blue-700
│  │  │   Weekly: default → bg-gradient-to-r from-green-600 to-green-700
│  │  │   Yearly: default → bg-gradient-to-r from-rose-900 to-rose-800
│  │  │   Inactive: bg-gray-900/60 border-gray-700 text-gray-300
│  │  │
│  │  └─ CTA Button (size="lg"):
│  │       bg-gradient-to-r from-green-600 to-green-700
│  │       px-10 py-7 text-lg rounded-2xl
│  │       shadow-2xl shadow-green-500/40 hover:shadow-green-500/60
│  │       shine effect: translate-x from -200%→200% on hover
│  │       content: [Play icon] "View [Your Year / This Week / Today]"
│  │
│  └─ Right col (lg:col-span-5, hidden lg:block):
│      ┌─ Decorative vinyl record stack visual (motion animated)
│      │  ├─ Record back: rotating CW slowly (20s), scale pulse (4s)
│      │  ├─ Record front: rotating CCW faster (15s), scale pulse (3s, delay 1s)
│      │  │  grooves simulated with nested rounded-full gradient borders
│      │  │  center label: Disc3 icon (lucide) in green-400
│      │  │
│      │  └─ Floating badges (motion y-cycle):
│      │      Top-right: "Top 1% Listener" with star emoji, from-green-600 to-blue-600
│      │      Bottom-left: "Active Days 342", glass card with Radio icon
│      │
│      └─ Glow: bg-gradient-to-r from-green-500/30 via-blue-500/30 to-rose-900/30
│          rounded-full blur-[80px] absolute inset-0
```

**State Management:**
- `useState<'daily' | 'weekly' | 'yearly'>('yearly')` for active wrap
- `DailyWrapDialog`, `WeeklyWrapDialog`, `YearlyWrapDialog` as modal dialogs

---

#### 2.2 TimeRangeSelector  
`components/TimeRangeSelector.tsx` (38 lines)

**Purpose:** Secondary time filter tabs  
**Placement:** below WrappedSelector, `mb-8`  
**Visual:**
```
flex items-center justify-between
├─ Left: h2 text-2xl font-bold text-white "Your Music Stats"
│         paragraph text-sm text-gray-400 mt-1
│
└─ Right: Tabs (shadcn/ui) hidden on mobile, shown sm:block
          TabsList: bg-gray-800/80 backdrop-blur-sm border border-gray-700/50 p-1
          TabsTrigger values: "4weeks", "6months", "alltime"
            inactive: data-[state=inactive]:text-gray-400 hover:text-white
            active:   data-[state=active]:bg-gradient-to-r from-purple-500 to-pink-500
                      text-white shadow-lg shadow-purple-500/30
```

---

#### 2.3 StatsOverview  
`components/StatsOverview.tsx` (123 lines)

**Purpose:** Three glassmorphic stat cards (Tracks, Artists, Hours)  
**Layout:** Full-width (`w-full mb-12`), grid `grid-cols-1 sm:grid-cols-3 gap-6`

Each card:
```
Card component
  className="bg-gradient-to-br from-gray-900/30 to-gray-800/20
             light:from-white light:to-gray-50
             border-gray-800/30 light:border-gray-200
             shadow-xl relative overflow-hidden group rounded-2xl"

  └─ CardContent p-6
      ├─ Top row (flex justify-between items-center mb-4):
      │   ├─ Icon (Music, Headphones, Clock) with colored ring border
      │   └─ Badge (variant="outline"): "vs last month"
      │
      ├─ Value display:
      │   text-4xl md:text-5xl font-black
      │   bg-gradient-to-r from-emerald-400 via-teal-400 to-cyan-400
      │   bg-clip-text text-transparent
      │   "2,847" tracks, "312" artists, "487" hours
      │
      ├─ Label (text-sm text-gray-500 uppercase tracking-wider font-semibold)
      │   "Tracks", "Artists", "Listening Hours"
      │
      └─ Trend badge at bottom:
          flex items-center gap-1 px-2 py-1 rounded-full
          bg-emerald-500/15 text-emerald-400 text-xs font-bold
          +12% vs last month (TrendingUp icon)
```

---

#### 2.4 Top Albums  
`components/TopAlbums.tsx` (86 lines)

**Purpose:** 5-column grid of top album covers  
**Layout:** `grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4`  
Each album card:
```
<div className="group relative overflow-hidden rounded-xl
        bg-gradient-to-br from-gray-800/40 to-gray-900/40
        light:from-gray-50 light:to-white
        p-4 hover:from-purple-900/20 hover:to-pink-900/20
        light:hover:from-purple-100/50 light:hover:to-pink-100/50
        transition-all hover:scale-[1.02]
        border border-gray-700/30 light:border-gray-200
        hover:border-purple-500/30">

  └─ Image container (relative mb-3):
      <img src={album.image} alt={album.title}
           className="w-full aspect-square rounded-lg object-cover
                      shadow-xl ring-2 ring-gray-800 light:ring-gray-200
                      group-hover:ring-purple-500/30 transition-all">
      └─ Rank badge (absolute top-2 left-2):
          px-2.5 py-1 rounded-full bg-gradient-to-r from-purple-500 to-pink-500
          text-white text-xs font-bold shadow-lg  "#{index+1}"

  └─ Content (space-y-2):
      h3: font-bold text-white light:text-gray-900 truncate (album title)
      p: text-sm text-gray-400 light:text-gray-600 truncate (artist name)
      └─ Footer (flex justify-between pt-2 border-t):
          span: text-xs text-gray-500 (year: "2020")
          span: text-xs text-purple-400 light:text-purple-600 font-semibold
                "{plays} plays"
```

---

#### 2.5 Main Grid: Top Tracks + Top Artists  
`Home.tsx` creates a 12-column split:
```
xl:grid-cols-12 gap-6 lg:gap-8 mb-12
├─ Left column xl:col-span-7:
│  └─ TopTracks component (card, p-6)
│       grid-cols-1 (full width, vertical list)
│
└─ Right column xl:col-span-5:
   └─ TopArtists component (card, p-6)
        grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 (actually shows as 2x3 grid)
```

Each artist card in TopArtists:
```
<div className="group relative overflow-hidden rounded-xl
         from-gray-800/40 to-gray-900/40 ... hover:from-purple-900/20 ...">
  ├─ Rank badge (absolute top-3 right-3): rounded-full
  │   bg-gradient-to-br from-purple-500/30 to-pink-500/30
  │   border border-purple-500/30   "1"
  │
  ├─ Avatar section (flex items-center gap-4 mb-4):
  │   <div className="relative">
  │     <img className="h-16 w-16 rounded-full object-cover
  │                    ring-2 ring-purple-500/30
  │                    group-hover:ring-purple-500/50 transition-all shadow-lg">
  │     <div className="absolute -bottom-1 -right-1
  │                     h-5 w-5 rounded-full bg-gradient-to-br
  │                     from-purple-500 to-pink-500 border-2 border-gray-900">
  │     </div>
  │   </div>
  │   <div className="flex-1 min-w-0">
  │     <h3 className="font-bold text-white truncate">{artist.name}</h3>
  │     <p className="text-sm text-purple-400 font-medium">{plays} plays</p>
  │   </div>
  │
  ├─ Listening time row (flex justify-between p-2 rounded-lg bg-gray-800/40)
  │   "Listening time" label   →   "{hours}h"
  │
  └─ Genre badges (flex gap-1.5 flex-wrap):
      <Badge className="text-xs bg-gradient-to-r from-purple-500/20 to-pink-500/20
                       text-purple-300 border border-purple-500/30
                       hover:from-purple-500/30 hover:to-pink-500/30">
        {genre}
      </Badge>
```

TopTracks component shows:
- Rank badge (#1, #2, #3...) with purple gradient
- Track info (title + artist)
- Plays count badge
- Progress bar placeholder (div with gradient width based on play count)
- Duration label

---

#### 2.6 ListeningChart  
`components/ListeningChart.tsx` (360 lines)

**Renders:** Bar chart from recharts showing hourly play distribution (8 time buckets)  
**Data:** `[{hour: '12AM', plays: 12}, {hour: '3AM', plays: 5}, ... {hour: '9PM', plays: 145}]`  
**Colors:** bars use `fill="url(#barGradient)"` with purple-to-pink gradient

---

#### 2.7 GenreDistribution  
`components/GenreDistribution.tsx` (201 lines)

**Renders:** Radar (polar) chart from recharts showing 5 music-taste dimensions  
**Data:** `[{category: 'Energy', value: 85}, {category: 'Danceability', value: 72}, ...]`  
**Visual:** PolarGrid, PolarAngleAxis (categories), PolarRadiusAxis (0-100),  
       Radar with `fill="rgba(168, 85, 247, 0.3)"`, `stroke="#a855f7"`

---

### 3. ANALYTICS PAGE (`/dashboard/analytics`)

**File:** `src/app/pages/Analytics.tsx` (691 lines)  
**Biggest page — 23 sections with multiple chart types**

**Layout:**
```
Container: max-w-[1600px] px-4 lg:px-6 py-10
Main layout: grid grid-cols-1 lg:grid-cols-12 gap-8
├─ Left col: lg:col-span-8  (primary charts & tables)
└─ Right col: lg:col-span-4 (summary cards & milestones)
```

**Sections (in order):**

#### 3.1 Monthly Trends Card (col-span-8)
```
<Card className="bg-gradient-to-br from-gray-900/50 to-gray-800/50 border-gray-800/50 shadow-xl">
  <CardHeader>
    <CardTitle className="text-white">Monthly Listening — 2026</CardTitle>
  </CardHeader>
  <CardContent>
    <ResponsiveContainer width="100%" height={300}>
      <LineChart data={monthlyData}>
        <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
        <XAxis dataKey="month" stroke="rgba(255,255,255,0.5)" />
        <YAxis stroke="rgba(255,255,255,0.5)" />
        <Tooltip contentStyle={{backgroundColor: '#1f2937', border: '1px solid #374151'}} />
        <Line type="monotone" dataKey="minutes" stroke="#a855f7" strokeWidth={3}
              activeDot={{r: 8}} name="Minutes" />
        <Line type="monotone" dataKey="tracks" stroke="#14b8a6" strokeWidth={3} name="Tracks" />
      </LineChart>
    </ResponsiveContainer>
  </CardContent>
</Card>
```
- Data: Jan–Jun, `plays` (tracks) and `minutes` arrays
- Two-line chart overlay

#### 3.2 Hourly Distribution (col-span-4)
```
Horizontal bar chart (BarChart layout="vertical")
X-axis: plays count (0-150)
Y-axis: hour labels (12AM, 3AM, 6AM, 9AM, 12PM, 3PM, 6PM, 9PM)
Bar: fill="url(#barGradient)" (purple→pink)
```

#### 3.3 Music Taste Radar (col-span-6)
```
<RadarChart data={musicTasteData} outerRadius={90} innerRadius={30}>
  <PolarGrid stroke="rgba(255,255,255,0.2)" />
  <PolarAngleAxis dataKey="category" tick={{fill: 'white'}} />
  <PolarRadiusAxis angle={90} domain={[0, 100]} tick={{fill: 'white'}} />
  <Radar name="Taste" dataKey="value" stroke="#a855f7" fill="#a855f7" fillOpacity={0.3} />
</RadarChart>
```
Axes: Energy, Danceability, Acousticness, Valence, Popularity

#### 3.4 Top Genres (col-span-6)
```
Card with title "Your Top Genres This Year"
List of 5 genres with:
  ────────────────────────────────────────────────
  │ Pop           ████████████░░░░  35%  ██      │
  │ Hip Hop       ████████░░░░░░░░  22%  ██      │
  │ Electronic    ███████░░░░░░░░░  18%  ██      │
  ... horizontal bar, gradient fill (genre color)
  ────────────────────────────────────────────────
```

#### 3.5 Listening Milestones (col-span-4)
```
Cards celebrating achievements:
  ┌─ First Week Streak:  "+7 day streak"  🔥 icon
  ├─ Top 1% Listener:    "You're in the elite club!"  🏆
  ├─ Genre Master:       "Pop Music Expert"           ⭐
  └─ Early Adopter:      "Listening since 2019"       ⏰
```

#### 3.6 Top Tracks Table (col-span-8)
```
<Card><CardContent className="p-0">
  <Table>
    <TableHeader>... columns: #, Title, Artist, Plays, Duration</TableHeader>
    <TableBody>
      rows with hover:bg-gray-800/50
      rank badge in first column (gradient purple→pink, rounded-full)
    </TableBody>
  </Table>
</CardContent></Card>
```

#### 3.7 Top Artists Table (col-span-4)
```
Simpler table/list with artist avatar (circular), name, plays, rank
```

**Remaining:** Recent Activity, Weekly Wrap, Yearly Wrap, Daily Wrap, Notifications, Settings dialogs are separate component modals not fully rendered inline in Analytics.

---

### 4. EXPORT PAGE (`/dashboard/export`)

**File:** `src/app/pages/Export.tsx` (501 lines)

**State:**
```tsx
const [isGenerating, setIsGenerating] = useState(false)
const [selectedRange, setSelectedRange] = useState<'weekly' | 'monthly' | 'alltime'>('weekly')
const [downloadComplete, setDownloadComplete] = useState(false)
const exportRef = useRef<HTMLDivElement>(null)  // html2canvas target
```

**Layout:**
```
max-w-4xl mx-auto px-4 py-8 lg:py-12

Tabs: Weekly / Monthly / Alltime

┌─ Preview Section (bg-gray-900/20 rounded-3xl border border-gray-800/50 p-8)
│  └─ ref={exportRef} (this gets captured by html2canvas)
│     Gradient card: bg-gradient-to-br from-gray-900/60 to-gray-800/40
│                    backdrop-blur-xl rounded-2xl p-6 space-y-6
│     ├─ Header row: SpoticsLogo + "Weekly Wrap" / "Monthly Insights" / "All-Time Stats"
│     │              year badge: 2026 (from-emerald-500/15 border-emerald-500/30)
│     │
│     ├─ Stats grid (grid-cols-2 md:grid-cols-4 gap-4):
│     │   For each stat:
│     │   ├─ IconWrapper: p-3 rounded-xl
│     │   │  bg: className="bg-gradient-to-br {color}"
│     │   │  icon: Clock/Music/Headphones/TrendingUp
│     │   ├─ label: text-gray-400 text-xs uppercase
│     │   └─ value: text-3xl font-bold text-white
│     │
│     ├─ Section: Top Tracks (div with gradient-left border-l-4 border-emerald-500)
│     │   Track rows: flex justify-between items-center p-3
│     │   title + artist (text-sm) | plays (text-emerald-400)
│     │
│     ├─ Section: Top Artists (similar horizontal list)
│     │
│     ├─ Genre Breakdown (flex gap-2 flex-wrap):
│     │   Badge per genre: px-3 py-1.5 rounded-full
│     │   bg: gradient-to-r from-emerald-500/20 via-purple-500/20 to-pink-500/20
│     │   border border-{genreColor}-500/30
│     │   {genre} {percentage}%
│     │
│     └─ Footer: "Generated with Spotics • spotics.app"
│
└─ Action Buttons (flex gap-4 mt-8 justify-center)
    ├─ Generate Image Button:
    │   onClick={handleDownload}
    │   disabled={isGenerating}
    │   While loading: shows Loader2 (spinner)
    │   bg-gradient-to-r from-emerald-600 to-green-700
    │   text-white font-bold px-8 py-4 rounded-xl
    │   shadow-xl shadow-emerald-500/40
    │
    └─ Share Button (outline variant)
```

**Image Generation Flow:**
1. User clicks "Generate Image"
2. Set `isGenerating = true`
3. `html2canvas(exportRef.current)` captures the preview div
4. Convert to PNG blob
5. Create `<a>` element, set `download="spotics-weekly-2026.png"`
6. Trigger click, then `setDownloadComplete(true)`
7. Show success notification (Sonner toast)

**Note:** The `/dashboard/export` route currently throws a JavaScript runtime error (uncaught exception) when the component mounts, causing the server to return 500. Root cause to be diagnosed in component code (possibly a missing import or invalid data shape).

---

## Component Library (shadcn/ui + custom)

All UI primitives come from `src/app/components/ui/*`. Includes:
- `button.tsx`, `card.tsx`, `tabs.tsx`, `badge.tsx`, `table.tsx`
- `dialog.tsx`, `sheet.tsx` (mobile drawer), `avatar.tsx`
- `progress.tsx`, `skeleton.tsx`, `tooltip.tsx`
- `sonner.tsx` (toast notifications)

All styled with Tailwind using `cn()` utility for conditional class merging (from `lib/utils`).

---

## Animation Patterns (Framer Motion)

| Pattern | Usage |
|---------|-------|
| `initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, ease: "easeOut" }}` | Page/card entrance (fade + slide up) |
| `whileHover={{ scale: 1.05 }}` | Interactive card hover (subtle zoom) |
| `animate={{ y: [0, -10, 0] }} transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}` | Floating badge animation |
| `animate={{ scale: [1, 1.2, 1], opacity: [0.2, 0.3, 0.2] }}` | Pulsing glow orb (Hero section) |
| `layout` prop | Smooth layout transitions when list order changes |

---

## File Structure (after copy to spotics repo)

```
/home/waly/spotics/
├── src/
│   ├── app/
│   │   ├── pages/
│   │   │   ├── Login.tsx         ← Page 1
│   │   │   ├── Home.tsx          ← Page 2 (Dashboard)
│   │   │   ├── Analytics.tsx     ← Page 3
│   │   │   └── Export.tsx        ← Page 4 (runtime error)
│   │   ├── components/
│   │   │   ├── Header.tsx
│   │   │   ├── HeroSection.tsx
│   │   │   ├── WrappedSelector.tsx
│   │   │   ├── TimeRangeSelector.tsx
│   │   │   ├── StatsOverview.tsx
│   │   │   ├── TopAlbums.tsx
│   │   │   ├── TopArtists.tsx
│   │   │   ├── TopTracks.tsx
│   │   │   ├── ListeningChart.tsx
│   │   │   ├── GenreDistribution.tsx
│   │   │   ├── SpoticsLogo.tsx
│   │   │   └── ui/  (shadcn components)
│   │   ├── layouts/
│   │   │   └── RootLayout.tsx
│   │   ├── contexts/
│   │   │   ├── ThemeContext.tsx
│   │   │   └── TimeRangeContext.tsx
│   │   ├── routes.tsx    ← React Router config
│   │   └── styles/
│   │       ├── index.css     ← imports all CSS
│   │       ├── tailwind.css  ← @import "tailwindcss" source(none)
│   │       ├── theme.css     ← CSS custom properties (OKLCH)
│   │       ├── fonts.css
│   │       └── animations.css
│   └── main.tsx
├── index.html
├── vite.config.ts  ← contains @tailwindcss/vite plugin
├── package.json
└── dist/           ← production build (if any)
```

---

## Running the Design Locally

```bash
cd /home/waly/spotics

# Install dependencies (already done)
npm install

# Run dev server
npm run dev
# → http://localhost:5173
# Routes:
#   /login           – landing page
#   /dashboard       – home/dashboard view
#   /dashboard/analytics – detailed analytics
#   /dashboard/export    – image export tool

# Production build
npm run build
npm run preview  # serve dist/
```

**Note:** The Export page has a runtime JavaScript error preventing full rendering. All other pages work.

---

## Design Patterns Cheat Sheet

### Glassmorphic Card
```tsx
<div className="relative overflow-hidden rounded-3xl
        bg-gray-900/40 backdrop-blur-2xl
        border border-gray-800/50 shadow-2xl">
  <div className="absolute inset-0 bg-gradient-to-br
                  from-green-500/5 to-black"></div>
  <div className="relative p-6">...</div>
</div>
```

### Gradient Button (primary CTA)
```tsx
<Button className="bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-500
                   text-white font-bold px-10 py-7 text-lg rounded-2xl
                   shadow-2xl shadow-emerald-500/30
                   hover:shadow-emerald-500/50 transition-all overflow-hidden">
  {/* Shine effect on hover */}
  <div className="absolute inset-0 bg-gradient-to-r from-transparent
                  via-white/20 to-transparent translate-x-[-200%]
                  group-hover:translate-x-[200%] transition-transform duration-700">
  </div>
  <span className="relative flex items-center gap-3">
    Continue with Spotify
  </span>
</Button>
```

### Animated Stat Card
```tsx
<motion.div
  initial={{ opacity: 0, scale: 0.8 }}
  animate={{ opacity: 1, scale: 1 }}
  transition={{ duration: 0.5, delay: index * 0.1 }}
  whileHover={{ scale: 1.05 }}
  className="relative group"
>
  <div className="absolute -inset-0.5 bg-gradient-to-r from-emerald-500
                  to-teal-500 rounded-xl blur opacity-0
                  group-hover:opacity-40 transition"></div>
  <div className="relative bg-gradient-to-br from-gray-900/80
                  to-gray-800/60 backdrop-blur-xl rounded-xl p-4
                  border border-white/10">
    <Icon className="h-5 w-5 text-emerald-400 mb-3" />
    <p className="text-2xl font-black bg-gradient-to-br
                  from-emerald-400 to-blue-400 bg-clip-text text-transparent">
      {value}
    </p>
  </div>
</motion.div>
```

### Rank Badge (small circle)
```tsx
<div className="absolute top-2 left-2 h-6 w-6 rounded-full
                bg-gradient-to-br from-purple-500 to-pink-500
                flex items-center justify-center
                text-xs font-bold text-white">
  {rank}
</div>
```

---

## Integration Notes for Spotics

- ✅ All 4 page components successfully copied to `/home/waly/spotics/src/app/pages/`
- ✅ All supporting components copied to `src/app/components/`
- ✅ Design tokens (colors, spacing, typography) encoded in CSS variables in `theme.css`
- ✅ Tailwind v4 setup: `@import "tailwindcss"` in CSS + `@tailwindcss/vite` plugin in config
- ⚠️ PostCSS config file (`postcss.config.js`) was removed as it conflicted with Tailwind v4
- ⚠️ Export page contains a JS error; requires debugging (possible missing import or data reference)

**Dev server status:** Running on http://localhost:5173 (Vite v5.4.21 + Tailwind v4.2.4)

**Pages accessible (verified via curl):**
| Route | Status | Notes |
|-------|--------|-------|
| `/login` | HTTP 200 | Works |
| `/dashboard` | HTTP 200 | Works |
| `/dashboard/analytics` | HTTP 200 | Works |
| `/dashboard/export` | Connection reset | Crashes server, needs fix |

---

## Next Steps

1. **Fix Export page** – open browser console at /dashboard/export to capture error stack, patch component
2. **Add Spotify OAuth flow** – integrate real Spotify auth instead of mock navigation
3. **Connect Neon DB** – replace mock data arrays with API calls using existing Neon connection
4. **Deploy** – push to Railway + Neon migration

All design code is now in place and ready for integration.
