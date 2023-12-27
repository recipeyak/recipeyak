// See env.js for adding environment variables

export const DEBUG = import.meta.env.DEV

// eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
export const GIT_SHA: string = DEBUG
  ? "development"
  : import.meta.env.FRONTEND_GIT_SHA

export const SENTRY_DSN =
  "https://9168fb38e6d2ec1e1731d68867bb6d94@o64108.ingest.sentry.io/4506287122939904"

export const DOMAIN = DEBUG ? "http://localhost:3000" : "https://recipeyak.com"
