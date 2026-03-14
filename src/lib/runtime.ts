export const IS_PRODUCTION = process.env.NODE_ENV === "production";
export const IS_TEST = process.env.NODE_ENV === "test";
export const IS_DEVELOPMENT = process.env.NODE_ENV !== "production" && process.env.NODE_ENV !== "test";

export const DEFAULT_SYNC_INTERVAL_MS = IS_PRODUCTION ? 30 * 60 * 1000 : 15 * 60 * 1000;
