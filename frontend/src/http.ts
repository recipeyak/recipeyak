import axios, {
  AxiosError,
  AxiosRequestConfig,
  AxiosResponse,
  CancelToken,
} from "axios"
import { Either, left } from "fp-ts/lib/Either"
import * as t from "io-ts"
import raven from "raven-js"

import { logout } from "@/auth"
import { queryClient } from "@/components/App"
import { Err, Ok, Result } from "@/result"
import { uuid4 } from "@/uuid"

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
    // eslint-disable-next-line @typescript-eslint/consistent-type-assertions
    return left(e as AxiosError | Error | t.Errors)
  }
}

/* We check if detail matches our string because Django will not return 401 when
 * the session expires
 */
const invalidToken = (res: AxiosResponse) =>
  res != null &&
  // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
  res.data.detail === "Authentication credentials were not provided."

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
    logout(queryClient)
  } else {
    // NOTE(chdsbd): I think it's a good idea just to report any other bad
    // status to Sentry.
    raven.captureException(error, { level: "info" })
  }

  return Promise.reject(error)
}

baseHttp.interceptors.response.use(
  (response) => response,

  // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
  (error) => handleResponseError(error),
)

baseHttp.interceptors.request.use(
  (cfg) => {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
    cfg.headers["X-Request-ID"] = uuid4()

    return cfg
  },

  (error) => Promise.reject(error),
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

type HttpRequestObjResult<A, O, T> = RequestOptions<A, O, T> & {
  send: () => Promise<Either<t.Errors | AxiosError | Error, A>>
}

/**
 * Result<T> based HTTP client
 */

export const http = {
  get: <T>(url: string, config?: AxiosRequestConfig): HttpResult<T> =>
    baseHttp.get<T>(url, config).then(toOk).catch(toErr),
  delete: (url: string, config?: AxiosRequestConfig): HttpResult<void> =>
    baseHttp.delete(url, config).then(toOk).catch(toErr),
  head: (url: string, config?: AxiosRequestConfig): HttpResult<void> =>
    baseHttp.head(url, config).then(toOk).catch(toErr),
  patch: <T>(
    url: string,
    data?: unknown,
    config?: AxiosRequestConfig,
  ): HttpResult<T> =>
    baseHttp.patch<T>(url, data, config).then(toOk).catch(toErr),
  put: <T>(
    url: string,
    data?: unknown,
    config?: AxiosRequestConfig,
  ): HttpResult<T> =>
    baseHttp.put<T>(url, data, config).then(toOk).catch(toErr),
  post: <T>(
    url: string,
    data?: unknown,
    config?: AxiosRequestConfig,
  ): HttpResult<T> =>
    baseHttp.post<T>(url, data, config).then(toOk).catch(toErr),
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
      send: () => http.request(options),
    }
  },
}
