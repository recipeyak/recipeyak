import React from "react"
import { isSameDay } from "date-fns"
import { second } from "@/date"

export function useCurrentDay() {
  const [date, setDate] = React.useState(new Date())

  React.useEffect(() => {
    const timerID = setInterval(() => {
      const newDate = new Date()
      if (!isSameDay(date, newDate)) {
        setDate(newDate)
      }
    }, 5 * second)
    return () => {
      clearInterval(timerID)
    }
  }, [date])

  return date
}
