import { useMutation } from "@tanstack/react-query"

import { findNextOpen } from "@/api"
import { unwrapResult } from "@/query"

const findNextOpenV2 = ({
  teamID,
  day,
  now,
}: {
  readonly teamID: number | "personal"
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
