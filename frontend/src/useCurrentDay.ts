import { isSameDay } from "date-fns"
import { useEffect, useState } from "react"

export function useCurrentDay() {
  const [date, setDate] = useState(new Date())

  useEffect(() => {
    const timerID = setInterval(() => {
      const newDate = new Date()
      if (!isSameDay(date, newDate)) {
        setDate(newDate)
      }
    }, 5 * 1000)
    return () => {
      clearInterval(timerID)
    }
  }, [date])

  return date
}
