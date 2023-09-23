import { useMutation } from "@tanstack/react-query"

import { http } from "@/http"
import { unwrapResult } from "@/query"

const findNextOpen = ({
  teamID,
  day,
  now,
}: {
  readonly teamID: number | "personal"
  readonly day: string
  readonly now: string
}) => {
  return http.get<{ readonly date: string }>(
    `/api/v1/t/${teamID}/calendar/next_open/`,
    {
      params: {
        day,
        now,
      },
    },
  )
}

const findNextOpenV2 = ({
  teamID,
  day,
  now,
}: {
  readonly teamID: number
  readonly day: string
  readonly now: string
}) => {
  return findNextOpen({ teamID, day, now }).then(unwrapResult)
}

export function useScheduledRecipeFindNextOpen() {
  return useMutation({
    mutationFn: findNextOpenV2,
  })
}
