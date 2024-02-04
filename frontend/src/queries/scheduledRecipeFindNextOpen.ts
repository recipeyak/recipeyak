import { useMutation } from "@tanstack/react-query"

import { calendarNextOpen } from "@/api/calendarNextOpen"

export function useScheduledRecipeFindNextOpen() {
  return useMutation({
    mutationFn: calendarNextOpen,
  })
}
