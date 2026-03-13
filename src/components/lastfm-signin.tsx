"use client";

import { FormEvent, useState } from "react";
import { signIn } from "next-auth/react";

export default function LastFmSignIn() {
  const [username, setUsername] = useState("");
  const [submitting, setSubmitting] = useState(false);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    if (!username.trim()) return;

    setSubmitting(true);
    await signIn("lastfm", {
      username: username.trim(),
      callbackUrl: "/dashboard",
    });
    setSubmitting(false);
  }

  return (
    <form onSubmit={onSubmit} className="space-y-3">
      <label className="block text-[0.7rem] uppercase tracking-[0.32em] text-white/45">Last.fm username</label>
      <div className="flex flex-col gap-3 sm:flex-row">
        <input
          type="text"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          placeholder="Enter your Last.fm username"
          className="h-14 flex-1 rounded-2xl border border-white/12 bg-white/5 px-4 text-sm text-white outline-none transition focus:border-fuchsia-300/60 focus:bg-white/8"
          required
        />
        <button
          type="submit"
          disabled={submitting}
          className="h-14 rounded-2xl bg-gradient-to-r from-fuchsia-500 via-purple-500 to-cyan-400 px-6 font-semibold text-black transition hover:scale-[1.01] disabled:opacity-70"
        >
          {submitting ? "Connecting..." : "Continue with Last.fm"}
        </button>
      </div>
    </form>
  );
}
