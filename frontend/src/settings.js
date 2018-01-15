/* eslint no-unused-vars: 0 */

const OAUTH_BITBUCKET_CLIENT_ID = process.env.OAUTH_BITBUCKET_CLIENT_ID
const OAUTH_BITBUCKET_REDIRECT_URI = process.env.OAUTH_BITBUCKET_REDIRECT_URI

const OAUTH_FACEBOOK_CLIENT_ID = process.env.OAUTH_FACEBOOK_CLIENT_ID
const OAUTH_FACEBOOK_REDIRECT_URI = process.env.OAUTH_FACEBOOK_REDIRECT_URI

const OAUTH_GITHUB_CLIENT_ID = process.env.OAUTH_GITHUB_CLIENT_ID
const OAUTH_GITHUB_REDIRECT_URI = process.env.OAUTH_GITHUB_REDIRECT_URI

const OAUTH_GITLAB_CLIENT_ID = process.env.OAUTH_GITLAB_CLIENT_ID
const OAUTH_GITLAB_REDIRECT_URI = process.env.OAUTH_GITLAB_REDIRECT_URI

const OAUTH_GOOGLE_CLIENT_ID = process.env.OAUTH_GOOGLE_CLIENT_ID
const OAUTH_GOOGLE_REDIRECT_URI = process.env.OAUTH_GOOGLE_REDIRECT_URI

// TODO: Add correct bitbucket redirect uri
export const BITBUCKET_OAUTH_URL = ''
// TODO: Add correct facebook redirect uri
export const FACEBOOK_OAUTH_URL = ''

export const GITHUB_OAUTH_URL = OAUTH_GITHUB_CLIENT_ID && OAUTH_GITHUB_REDIRECT_URI &&
  `https://github.com/login/oauth/authorize?client_id=${OAUTH_GITHUB_CLIENT_ID}&scope=user:email&redirect_uri=${OAUTH_GITHUB_REDIRECT_URI}`

export const GITLAB_OAUTH_URL = OAUTH_GITLAB_CLIENT_ID && OAUTH_GITLAB_REDIRECT_URI &&
  `https://gitlab.com/oauth/authorize?client_id=${OAUTH_GITLAB_CLIENT_ID}&response_type=code&scope=read_user&redirect_uri=${OAUTH_GITLAB_REDIRECT_URI}`

// TODO: Add correct facebook redirect uri
export const GOOGLE_OAUTH_URL = ''

export const SENTRY_DSN = process.env.FRONTEND_SENTRY_DSN
