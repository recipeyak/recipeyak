// See env.js for adding environment variables

const DEBUG = import.meta.env.DEV

// eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
export const GIT_SHA: string = DEBUG
  ? "development"
  : import.meta.env.FRONTEND_GIT_SHA
// eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
export const API_GIT_TREE_SHA: string = DEBUG
  ? "development"
  : import.meta.env.FRONTEND_API_GIT_TREE_SHA

export const SENTRY_DSN =
  "https://9168fb38e6d2ec1e1731d68867bb6d94@o64108.ingest.sentry.io/4506287122939904"

export const DOMAIN = DEBUG ? "http://localhost" : "https://recipeyak.com"

// eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
export const IMAGE_TRANSFORM_FORMAT: string =
  import.meta.env.FRONTEND_IMAGE_TRANSFORM_FORMAT || "twicpics"
