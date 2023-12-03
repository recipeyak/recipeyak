// See env.js for adding environment variables

export const DEBUG = process.env.NODE_ENV !== "production"

// eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
export const GIT_SHA: string = DEBUG
  ? "development"
  : // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    process.env.NEXT_PUBLIC_GIT_SHA!

export const SENTRY_DSN =
  "https://9168fb38e6d2ec1e1731d68867bb6d94@o64108.ingest.sentry.io/4506287122939904"

export const DOMAIN = DEBUG ? "http://localhost:3000" : "https://recipeyak.com"
