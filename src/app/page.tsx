const ranges = ["24H", "7D", "30D"];

const topTracks = [
  { name: "After Hours", artist: "The Weeknd", plays: 42 },
  { name: "Snooze", artist: "SZA", plays: 37 },
  { name: "Calm Down", artist: "Rema", plays: 35 },
];

const topArtists = [
  { name: "Burna Boy", plays: 88 },
  { name: "Drake", plays: 73 },
  { name: "Tems", plays: 69 },
];

const topAlbums = [
  { name: "SOS", artist: "SZA", plays: 51 },
  { name: "I Told Them…", artist: "Burna Boy", plays: 44 },
  { name: "Her Loss", artist: "Drake & 21 Savage", plays: 41 },
];

export default function Home() {
  return (
    <main className="min-h-screen bg-[#070611] text-white">
      <div className="mx-auto max-w-6xl px-6 py-10">
        <header className="mb-10 rounded-3xl border border-white/10 bg-gradient-to-r from-fuchsia-600/30 via-violet-500/20 to-cyan-400/30 p-8">
          <p className="text-sm uppercase tracking-[0.3em] text-fuchsia-200">Spotics</p>
          <h1 className="mt-3 text-4xl font-bold sm:text-5xl">Your Spotify listening intelligence</h1>
          <p className="mt-4 max-w-2xl text-white/80">
            Sign in with Spotify to see your top tracks, artists, and albums across 24 hours, 7 days, and 30 days.
          </p>
          <div className="mt-6 flex flex-wrap gap-3">
            <a
              href="/api/auth/signin/spotify"
              className="rounded-xl bg-green-500 px-5 py-3 font-semibold text-black transition hover:bg-green-400"
            >
              Continue with Spotify
            </a>
            <a href="/dashboard" className="rounded-xl border border-white/20 px-5 py-3 font-semibold hover:bg-white/10">
              Open Dashboard
            </a>
          </div>
        </header>

        <section className="mb-8 flex flex-wrap gap-3">
          {ranges.map((r, i) => (
            <button
              key={r}
              className={`rounded-full px-5 py-2 text-sm font-semibold transition ${
                i === 1 ? "bg-white text-black" : "border border-white/20 text-white/80 hover:bg-white/10"
              }`}
            >
              {r}
            </button>
          ))}
        </section>

        <section className="grid gap-5 md:grid-cols-3">
          <StatsCard title="Total Plays" value="1,842" hint="last 7 days" color="from-cyan-400/40" />
          <StatsCard title="Unique Artists" value="127" hint="last 7 days" color="from-fuchsia-400/40" />
          <StatsCard title="Discovery Score" value="74%" hint="new artists ratio" color="from-emerald-400/40" />
        </section>

        <section className="mt-8 grid gap-6 lg:grid-cols-3">
          <RankingCard title="Top Songs" accent="text-cyan-300" items={topTracks.map((x) => `${x.name} — ${x.artist} (${x.plays})`)} />
          <RankingCard title="Top Artists" accent="text-fuchsia-300" items={topArtists.map((x) => `${x.name} (${x.plays})`)} />
          <RankingCard title="Top Albums" accent="text-emerald-300" items={topAlbums.map((x) => `${x.name} — ${x.artist} (${x.plays})`)} />
        </section>
      </div>
    </main>
  );
}

function StatsCard({ title, value, hint, color }: { title: string; value: string; hint: string; color: string }) {
  return (
    <article className={`rounded-2xl border border-white/10 bg-gradient-to-br ${color} to-transparent p-5`}>
      <p className="text-sm text-white/70">{title}</p>
      <p className="mt-2 text-3xl font-bold">{value}</p>
      <p className="mt-2 text-sm text-white/70">{hint}</p>
    </article>
  );
}

function RankingCard({ title, items, accent }: { title: string; items: string[]; accent: string }) {
  return (
    <article className="rounded-2xl border border-white/10 bg-white/5 p-5 backdrop-blur">
      <h2 className={`mb-4 text-xl font-semibold ${accent}`}>{title}</h2>
      <ol className="space-y-3 text-sm text-white/90">
        {items.map((item, idx) => (
          <li key={item} className="flex gap-3 rounded-xl border border-white/10 p-3">
            <span className="font-mono text-white/60">#{idx + 1}</span>
            <span>{item}</span>
          </li>
        ))}
      </ol>
    </article>
  );
}
