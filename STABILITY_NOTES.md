# Stability notes

This file tracks the main resilience choices introduced before Railway testing.

## Current protections

- Last.fm requests retry with lightweight backoff
- manual sync endpoint can return JSON or redirect safely
- duplicate sync runs are skipped if one is already active recently
- duplicate insight rows for the same snapshot/type/title are avoided
- dashboard surfaces sync failures through `syncError`
- empty sync results are treated as successful but empty, not as a crash

## Remaining risk areas

- no background queue yet; syncs still happen inline
- snapshot generation can become heavier as data volume grows
- recap generation is still simple and not optimized for many users
- comparison logic assumes relatively clean time windows

## Railway testing priority

During test deploy, watch for:
- sync duration
- Last.fm API rate/timeout behavior
- duplicate user/profile creation edge cases
- Prisma query latency on hosted Postgres
