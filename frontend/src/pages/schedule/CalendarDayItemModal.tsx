import { format } from "date-fns"
import React from "react"
import { Link } from "react-router-dom"

import * as api from "@/api"
import cls from "@/classnames"
import { Box } from "@/components/Box"
import { Modal } from "@/components/Modal"
import { formatAbsoluteDate, toISODateString } from "@/date"
import { useDispatch } from "@/hooks"
import { TimelineEvent } from "@/pages/recipe-detail/Notes"
import { isOk } from "@/result"
import { moveCalendarRecipe } from "@/store/reducers/calendar"
import { recipeURL } from "@/urls"

const options = [
  "Sunday",
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
  "Weekend",
  "Weekday",
] as const

export function CalendarDayItemModal({
  scheduledId,
  recipeName,
  recipeId,
  teamID,
  date,
  onClose,
  createdAt,
  createdBy,
}: {
  readonly scheduledId: number
  readonly recipeId: number | string
  readonly teamID: number | "personal"
  readonly recipeName: string
  readonly date: Date
  readonly onClose: () => void
  readonly createdAt: string
  readonly createdBy: {
    readonly id: number | string
    readonly name: string
    readonly avatar_url: string
  } | null
}) {
  const [day, setDay] = React.useState(format(date, "EEEE"))
  const [localDate, setLocalDate] = React.useState(toISODateString(date))
  const [findingNextOpen, setFindingNextOpen] = React.useState(false)
  const [saving, setSaving] = React.useState(false)
  const [deleting, setDeleting] = React.useState(false)
  const dispatch = useDispatch()

  const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setLocalDate(e.target.value)
  }
  const handleFindNextOpen = () => {
    setFindingNextOpen(true)
    void api.findNextOpen({ teamID, day, now: localDate }).then((res) => {
      if (isOk(res)) {
        setLocalDate(res.data.date)
      }
      setFindingNextOpen(false)
    })
  }
  const handleSelectChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setDay(e.target.value)
  }
  const handleDelete = () => {
    if (confirm(`Are you sure you want to delete '${recipeName}'?`)) {
      setDeleting(true)
      void api.deleteScheduledRecipe(scheduledId, teamID).then(() => {
        setDeleting(false)
        onClose()
      })
    }
  }
  const handleSave = () => {
    setSaving(true)
    void api
      .updateScheduleRecipe(scheduledId, teamID, {
        on: toISODateString(localDate),
      })
      .then((res) => {
        if (isOk(res)) {
          dispatch(
            moveCalendarRecipe({
              id: scheduledId,
              to: toISODateString(res.data.on),
            }),
          )
          setSaving(false)
          onClose()
        }
        setSaving(false)
      })
  }

  const to = recipeURL(recipeId, recipeName)
  const [reschedulerOpen, setReschedulerOpen] = React.useState(false)

  const prettyDate = formatAbsoluteDate(date, { includeYear: true })
  return (
    <Modal
      show
      onClose={onClose}
      title={prettyDate}
      content={
        <>
          <Box dir="col" gap={2}>
            <Link to={to} className="fs-4">
              {recipeName}
            </Link>

            <Box space="between">
              <button
                className={cls("button is-small", {
                  "is-active": reschedulerOpen,
                })}
                onClick={() => {
                  setReschedulerOpen((val) => !val)
                }}
              >
                Reschedule
              </button>
              <Link to={to} className="button is-primary is-small">
                View Recipe
              </Link>
            </Box>
          </Box>

          {reschedulerOpen && (
            <>
              <hr className="my-3" />
              <Box dir="col" gap={2}>
                <input
                  value={toISODateString(localDate)}
                  onChange={handleDateChange}
                  type="date"
                  style={{
                    border: "1px solid lightgray",
                    borderRadius: 5,
                    padding: "0.25rem",
                  }}
                />
                <Box gap={2} align="center">
                  <div className="fs-14px">next open</div>
                  <select
                    value={day}
                    onChange={handleSelectChange}
                    disabled={findingNextOpen}
                  >
                    {options.map((opt) => {
                      return (
                        <option value={opt} key={opt}>
                          {opt}
                        </option>
                      )
                    })}
                  </select>
                  <button
                    onClick={handleFindNextOpen}
                    disabled={findingNextOpen}
                  >
                    {!findingNextOpen ? "find" : "finding..."}
                  </button>
                </Box>
              </Box>

              <Box space="between" align="center">
                <button onClick={handleDelete} disabled={deleting}>
                  {!deleting ? "delete" : "deleting..."}
                </button>
                <div>
                  <button className="mr-2" onClick={onClose}>
                    cancel
                  </button>
                  <button onClick={handleSave} disabled={saving}>
                    {!saving ? "save" : "saving..."}
                  </button>
                </div>
              </Box>
            </>
          )}

          <hr className="my-2" />

          <TimelineEvent
            enableLinking={false}
            event={{
              id: scheduledId,
              action: "scheduled",
              created_by: createdBy,
              created: createdAt,
            }}
          />
        </>
      }
    />
  )
}
