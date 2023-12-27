import { QueryClient } from "@tanstack/react-query"
import { AxiosError } from "axios"

const MAX_RETRIES = 6
const HTTP_STATUS_TO_NOT_RETRY = [400, 401, 403, 404]

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      gcTime: 1000 * 60 * 60 * 24 * 7, // 7 days
      retry: (failureCount, err) => {
        if (failureCount > MAX_RETRIES) {
          return false
        }

        // eslint-disable-next-line @typescript-eslint/consistent-type-assertions
        const error = err as AxiosError | undefined
        if (HTTP_STATUS_TO_NOT_RETRY.includes(error?.response?.status ?? 0)) {
          // eslint-disable-next-line no-console
          console.warn(
            `Aborting retry due to ${error?.response?.status} status`,
          )
          return false
        }

        return true
      },
    },
  },
})
