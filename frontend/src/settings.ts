// See env.js for adding environment variables

export const DEBUG = process.env.NODE_ENV === "development"

export const GIT_SHA = DEBUG ? "development" : process.env.GIT_SHA

export const SENTRY_DSN = process.env.FRONTEND_SENTRY_DSN

export const DOMAIN = DEBUG ? "http://localhost:3000" : "https://recipeyak.com"