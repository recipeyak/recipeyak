import { useMutation } from "@tanstack/react-query"

import { http } from "@/http"
import { unwrapResult } from "@/query"

const findNextOpen = ({
  day,
  now,
}: {
  readonly day: string
  readonly now: string
}) => {
  return http.get<{ readonly date: string }>(`/api/v1/calendar/next_open/`, {
    params: {
      day,
      now,
    },
  })
}

const findNextOpenV2 = ({
  day,
  now,
}: {
  readonly day: string
  readonly now: string
}) => {
  return findNextOpen({ day, now }).then(unwrapResult)
}

export function useScheduledRecipeFindNextOpen() {
  return useMutation({
    mutationFn: findNextOpenV2,
  })
}
