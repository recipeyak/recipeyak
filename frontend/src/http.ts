import axios, {
  AxiosError,
  CancelToken,
  AxiosRequestConfig,
  AxiosResponse,
} from "axios"
import { uuid4 } from "@/uuid"
import { store } from "@/store/store"
import raven from "raven-js"
import { setUserLoggedIn } from "@/store/reducers/user"
import { Result, Ok, Err } from "@/result"
import * as t from "io-ts"
import { Either, left } from "fp-ts/lib/Either"
import queryString from "query-string"

export const baseHttp = axios.create()

type Method =
  | "GET"
  | "POST"
  | "PUT"
  | "DELETE"
  | "HEAD"
  | "OPTIONS"
  | "CONNECT"
  | "PATCH"
  | "TRACE"

type Params = Record<string, string | number>

/**
 * Version 3 of the http client library used in this repo. First we used
 * axios, then we wrapped axios in some exception handling to get result
 * types, now we incorporate runtime type checking via io-ts to validate the
 * response types.
 */
async function http3<T, A, O>({
  url,
  method,
  params,
  cancelToken,
  shape,
  data,
}: {
  readonly url: string
  readonly method: Method
  readonly data?: T
  readonly shape: t.Type<A, O>
  readonly params?: Params
  readonly cancelToken?: CancelToken
}): Promise<Either<t.Errors | AxiosError | Error, A>> {
  // tslint:disable-next-line: no-try
  try {
    const r = await baseHttp.request<unknown>({
      url,
      method,
      params,
      cancelToken,
      data,
    })
    return shape.decode(r.data)
  } catch (e) {
    return left(e)
  }
}

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
  error => handleResponseError(error),
)

baseHttp.interceptors.request.use(
  cfg => {
    // tslint:disable:no-unsafe-any
    cfg.headers["X-Request-ID"] = uuid4()
    // tslint:disable:no-unsafe-any
    return cfg
  },
  // tslint:disable-next-line:no-throw
  error => Promise.reject(error),
)

type HttpResult<T> = Promise<Result<T, AxiosError>>

const toOk = <T>(res: AxiosResponse<T>) => Ok(res.data)
const toErr = Err

type RequestOptions<A, O, T> = {
  readonly shape: t.Type<A, O>
  readonly params?: Params
  readonly method: Method
  readonly url: string
  readonly data?: T
}

export type HttpRequestObjResult<A, O, T> = RequestOptions<A, O, T> & {
  send: () => Promise<Either<t.Errors | AxiosError | Error, A>>
  getCacheKey: () => string
}

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
    config?: AxiosRequestConfig,
  ): HttpResult<T> =>
    baseHttp
      .patch<T>(url, data, config)
      .then(toOk)
      .catch(toErr),
  put: <T>(
    url: string,
    data?: {} | unknown,
    config?: AxiosRequestConfig,
  ): HttpResult<T> =>
    baseHttp
      .put<T>(url, data, config)
      .then(toOk)
      .catch(toErr),
  post: <T>(
    url: string,
    data?: {} | unknown,
    config?: AxiosRequestConfig,
  ): HttpResult<T> =>
    baseHttp
      .post<T>(url, data, config)
      .then(toOk)
      .catch(toErr),
  request: <T, A, O>(options: {
    readonly shape: t.Type<A, O>
    readonly params?: Params
    readonly method: Method
    readonly url: string
    readonly data?: T
  }): Promise<Either<t.Errors | AxiosError | Error, A>> => {
    return http3(options)
  },
  obj: <A, O, T>(
    options: RequestOptions<A, O, T>,
  ): HttpRequestObjResult<A, O, T> => {
    return {
      ...options,
      getCacheKey: () =>
        options.url + "." + queryString.stringify(options.params ?? {}),
      send: () => http.request(options),
    }
  },
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
