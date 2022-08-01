// See env.js for adding environment variables

export const DEBUG = import.meta.env.DEV

export const GIT_SHA: string = DEBUG ? "development" : import.meta.env.GIT_SHA

export const SENTRY_DSN: string = import.meta.env.FRONTEND_SENTRY_DSN

export const DOMAIN = DEBUG ? "http://localhost:3000" : "https://recipeyak.com"
