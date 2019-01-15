// Grab white-listed environment variables and prepare them to be
// injected into the application via DefinePlugin in Webpack configuration.

const WHITELIST = [
  "NODE_ENV",

  "GIT_SHA",

  "OAUTH_BITBUCKET_CLIENT_ID",

  "OAUTH_FACEBOOK_CLIENT_ID",

  "OAUTH_GITHUB_CLIENT_ID",

  "OAUTH_GITLAB_CLIENT_ID",

  "OAUTH_GOOGLE_CLIENT_ID",

  "FRONTEND_SENTRY_DSN"
]

/** @typedef IClientEnv
 * @property {{ "process.env": {[key: string]: string} }} stringified
 * @property {{[key: string | undefined]: string}} raw
 */

/** @param {string} publicUrl
 * @returns {IClientEnv}
 */
function getClientEnvironment(publicUrl) {
  const raw = Object.keys(process.env)
    .filter(key => WHITELIST.includes(key))
    .reduce(
      /** @param {{[key: string]: string | undefined}} env */
      (env, key) => {
        env[key] = process.env[key]
        return env
      },
      {
        // Useful for determining whether we’re running in production mode.
        // Most importantly, it switches React into the correct mode.
        NODE_ENV: process.env.NODE_ENV || "development",
        // Useful for resolving the correct path to static assets in `public`.
        // For example, <img src={process.env.PUBLIC_URL + '/img/logo.png'} />.
        // This should only be used as an escape hatch. Normally you would put
        // images into the `src` and `import` them in code to get their paths.
        PUBLIC_URL: publicUrl
      }
    )
  // Stringify all values so we can feed into Webpack DefinePlugin
  const stringified = {
    "process.env": Object.keys(raw).reduce((env, key) => {
      // @ts-ignore
      env[key] = JSON.stringify(raw[key])
      return env
    }, {})
  }

  return { raw, stringified }
}

module.exports = getClientEnvironment
