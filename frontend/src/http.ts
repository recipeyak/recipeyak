import axios, { AxiosError, AxiosRequestConfig, AxiosResponse } from "axios"
import { uuid4 } from "@/uuid"
import { store } from "@/store/store"
import raven from "raven-js"
import { setUserLoggedIn } from "@/store/reducers/user"
import { Result, Ok, Err } from "@/result"

export const baseHttp = axios.create({ timeout: 15000 })

/* We check if detail matches our string because Django will not return 401 when
 * the session expires
 */
const invalidToken = (res: AxiosResponse) =>
  // tslint:disable:no-unsafe-any
  res != null &&
  res.data.detail === "Authentication credentials were not provided."
// tslint:enable:no-unsafe-any
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
  // tslint:disable-next-line:no-throw
  return Promise.reject(error)
}

baseHttp.interceptors.response.use(
  response => response,
  // tslint:disable-next-line:no-unsafe-any
  error => handleResponseError(error)
)

baseHttp.interceptors.request.use(
  cfg => {
    // tslint:disable:no-unsafe-any
    cfg.headers["X-Request-ID"] = uuid4()
    // tslint:disable:no-unsafe-any
    return cfg
  },
  // tslint:disable-next-line:no-throw
  error => Promise.reject(error)
)

type HttpResult<T> = Promise<Result<T, AxiosError>>

const toOk = <T>(res: AxiosResponse<T>) => Ok(res.data)
const toErr = Err

/**
 * Result<T> based HTTP client
 */
// tslint:disable:no-promise-catch
export const http = {
  get: <T>(url: string, config?: AxiosRequestConfig): HttpResult<T> =>
    baseHttp
      .get<T>(url, config)
      .then(toOk)
      .catch(toErr),
  delete: (url: string, config?: AxiosRequestConfig): HttpResult<void> =>
    baseHttp
      .delete(url, config)
      .then(toOk)
      .catch(toErr),
  head: (url: string, config?: AxiosRequestConfig): HttpResult<void> =>
    baseHttp
      .head(url, config)
      .then(toOk)
      .catch(toErr),
  patch: <T>(
    url: string,
    data?: {} | unknown,
    config?: AxiosRequestConfig
  ): HttpResult<T> =>
    baseHttp
      .patch<T>(url, data, config)
      .then(toOk)
      .catch(toErr),
  put: <T>(
    url: string,
    data?: {} | unknown,
    config?: AxiosRequestConfig
  ): HttpResult<T> =>
    baseHttp
      .put<T>(url, data, config)
      .then(toOk)
      .catch(toErr),
  post: <T>(
    url: string,
    data?: {} | unknown,
    config?: AxiosRequestConfig
  ): HttpResult<T> =>
    baseHttp
      .post<T>(url, data, config)
      .then(toOk)
      .catch(toErr)
}
// tslint:enable:no-promise-catch

/** Get the detail string from a response, if available, otherwise return the default */
export function detailOrDefault(err: AxiosError, def: string): string {
  if (err.response && err.response.data) {
    if (typeof err.response.data.detail === "string") {
      return err.response.data.detail
    }
    if (Array.isArray(err.response.data.detail)) {
      return err.response.data.detail.join(" ")
    }
  }
  return def
}
