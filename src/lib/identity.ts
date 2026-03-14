import { db } from "@/lib/db";

export async function ensureUserAndProfile(lastfmUsername: string) {
  const normalized = lastfmUsername.trim().toLowerCase();
  const displayName = lastfmUsername.trim();

  const existing = await db.connectedProfile.findUnique({
    where: {
      provider_externalUsername: {
        provider: "lastfm",
        externalUsername: normalized,
      },
    },
    include: { user: true },
  });

  if (existing) {
    if (existing.displayName !== displayName) {
      await db.connectedProfile.update({
        where: { id: existing.id },
        data: { displayName },
      });
    }
    return existing;
  }

  const user = await db.user.create({
    data: {
      name: displayName,
      onboardingCompleted: true,
    },
  });

  return db.connectedProfile.create({
    data: {
      userId: user.id,
      provider: "lastfm",
      externalUsername: normalized,
      displayName,
      isPrimary: true,
    },
  });
}
