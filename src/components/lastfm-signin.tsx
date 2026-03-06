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
    <form onSubmit={onSubmit} className="flex flex-wrap items-center gap-2">
      <input
        type="text"
        value={username}
        onChange={(e) => setUsername(e.target.value)}
        placeholder="Last.fm username"
        className="min-w-[220px] rounded-xl border border-white/20 bg-black/20 px-3 py-2 text-sm text-white placeholder:text-white/50 outline-none focus:border-red-300"
        required
      />
      <button
        type="submit"
        disabled={submitting}
        className="rounded-xl bg-red-500 px-5 py-3 font-semibold text-white transition hover:bg-red-400 disabled:opacity-70"
      >
        {submitting ? "Signing in..." : "Continue with Last.fm"}
      </button>
    </form>
  );
}
