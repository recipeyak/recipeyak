/* eslint no-unused-vars: 0 */

/* See env.js for adding environment variables */

const DEBUG = process.env.NODE_ENV === 'development'

export const GIT_SHA = DEBUG ? 'development' : process.env.GIT_SHA

export const SENTRY_DSN = process.env.FRONTEND_SENTRY_DSN

const DOMAIN = DEBUG ? 'http://localhost:3000' : 'https://recipeyak.com'

const OAUTH_BITBUCKET_CLIENT_ID = process.env.OAUTH_BITBUCKET_CLIENT_ID
const OAUTH_FACEBOOK_CLIENT_ID = process.env.OAUTH_FACEBOOK_CLIENT_ID
const OAUTH_GITHUB_CLIENT_ID = process.env.OAUTH_GITHUB_CLIENT_ID
const OAUTH_GITLAB_CLIENT_ID = process.env.OAUTH_GITLAB_CLIENT_ID
const OAUTH_GOOGLE_CLIENT_ID = process.env.OAUTH_GOOGLE_CLIENT_ID

const OAUTH_BITBUCKET_REDIRECT_URI = `${DOMAIN}/accounts/bitbucket`
const OAUTH_FACEBOOK_REDIRECT_URI = `${DOMAIN}/accounts/facebook`
const OAUTH_GITHUB_REDIRECT_URI = `${DOMAIN}/accounts/github`
const OAUTH_GITLAB_REDIRECT_URI = `${DOMAIN}/accounts/gitlab`
const OAUTH_GOOGLE_REDIRECT_URI = `${DOMAIN}/accounts/google`

// TODO: Add Bitbucket, Facebook, and Google
export const BITBUCKET_OAUTH_URL = ''
export const FACEBOOK_OAUTH_URL = ''
export const GOOGLE_OAUTH_URL = ''

export const GITHUB_OAUTH_URL = OAUTH_GITHUB_CLIENT_ID &&
  `https://github.com/login/oauth/authorize?client_id=${OAUTH_GITHUB_CLIENT_ID}&scope=user:email&redirect_uri=${OAUTH_GITHUB_REDIRECT_URI}`

export const GITLAB_OAUTH_URL = OAUTH_GITLAB_CLIENT_ID &&
  `https://gitlab.com/oauth/authorize?client_id=${OAUTH_GITLAB_CLIENT_ID}&response_type=code&scope=read_user&redirect_uri=${OAUTH_GITLAB_REDIRECT_URI}`
