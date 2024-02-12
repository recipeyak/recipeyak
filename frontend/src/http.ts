import * as Sentry from "@sentry/react"
import axios, { AxiosError } from "axios"

import { logout } from "@/auth"
import { queryClient } from "@/components/queryClient"
import { uuid4 } from "@/uuid"

export const baseHttp = axios.create()

const handleResponseError = (error: AxiosError) => {
  // 503 means we are in maintenance mode. Reload to show maintenance page.
  const maintenanceMode = error.response && error.response.status === 503
  // Report all 500 errors
  const serverError =
    !maintenanceMode && error.response && error.response.status >= 500
  // Report request timeouts
  const requestTimeout = error.code === "ECONNABORTED"
  const unAuthenticated =
    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
    error.response?.data?.error?.code === "not_authenticated"
  if (maintenanceMode) {
    location.reload()
  } else if (serverError || requestTimeout) {
    Sentry.captureException(error, (scope) =>
      scope
        .setTags({ responseStatus: error.response?.status, code: error.code })
        .setExtras({ response: error.response }),
    )
  } else if (unAuthenticated) {
    logout(queryClient)
  } else {
    // NOTE(chdsbd): I think it's a good idea just to report any other bad
    // status to Sentry.
    Sentry.captureException(error, { level: "info" })
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
