# Spotics Production Foundation

This document defines the intent of the first rebuild branch.

## Objectives

1. Move Spotics from prototype framing to product framing.
2. Replace temporary architecture assumptions with production scaffolding.
3. Prepare the codebase for persisted listening history and sync jobs.
4. Remove misleading or dead architectural leftovers.

## Phase 1 deliverables

- Runtime environment validation via `src/lib/env.ts`
- Prisma schema for users, profiles, scrobbles, rollups, insights, recaps, and notification events
- Prisma client scaffold via `src/lib/db.ts`
- Honest README and product language
- Removal of old Spotify helper from active architecture

## Non-goals for this phase

- Full sync pipeline implementation
- Full migration of dashboard queries to database-backed rollups
- Notification delivery
- Public recap generation
- Full account-system redesign

## Phase 2 direction

The next step after this document is implemented as code is:
- persist Last.fm scrobbles
- record sync runs
- use database-backed reads for dashboard/analytics surfaces
- expose a sync entrypoint the product can call safely while the richer background job system is still being built

## Engineering principles

- Prefer honest metrics over decorative placeholders.
- Keep product claims behind implementation truth.
- Build for observability early.
- Model the long-term domain now, even if all tables are not yet active.
- Keep the app shippable while the rebuild is in progress.
