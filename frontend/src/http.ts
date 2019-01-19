import axios, { AxiosError } from "axios"
import { uuid4 } from "@/uuid"
import Cookie from "js-cookie"
import { store } from "@/store/store"
import raven from "raven-js"
import { invalidToken } from "@/store/thunks"
import { setUserLoggedIn } from "@/store/reducers/user"

const config = { timeout: 15000 }

const http = axios.create(config)

const handleResponseError = (error: AxiosError) => {
  // 503 means we are in maintenance mode. Reload to show maintenance page.
  const maintenanceMode = error.response && error.response.status === 503
  // Report all 500 errors
  const serverError =
    !maintenanceMode && error.response && error.response.status >= 500
  // Report request timeouts
  const requestTimeout = error.code === "ECONNABORTED"
  const unAuthenticated = error.response && invalidToken(error.response)
  if (maintenanceMode) {
    location.reload()
  } else if (serverError || requestTimeout) {
    raven.captureException(error)
  } else if (unAuthenticated) {
    store.dispatch(setUserLoggedIn(false))
  } else {
    // NOTE(chdsbd): I think it's a good idea just to report any other bad
    // status to Sentry.
    raven.captureException(error, { level: "info" })
  }
  return Promise.reject(error)
}

http.interceptors.response.use(
  response => response,
  // tslint:disable-next-line:no-unsafe-any
  error => handleResponseError(error)
)

http.interceptors.request.use(
  cfg => {
    const csrfToken = Cookie.get("csrftoken")
    // tslint:disable:no-unsafe-any
    cfg.headers["X-CSRFTOKEN"] = csrfToken
    cfg.headers["X-Request-ID"] = uuid4()
    // tslint:disable:no-unsafe-any
    return cfg
  },
  error => Promise.reject(error)
)

export { http }
