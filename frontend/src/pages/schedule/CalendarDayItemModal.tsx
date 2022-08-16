import { format } from "date-fns"
import React from "react"
import { Link } from "react-router-dom"

import * as api from "@/api"
import cls from "@/classnames"
import Modal from "@/components/Modal"
import { toISODateString } from "@/date"
import { useDispatch } from "@/hooks"
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
}: {
  readonly scheduledId: number
  readonly recipeId: number | string
  readonly teamID: number | "personal"
  readonly recipeName: string
  readonly date: Date
  readonly onClose: () => void
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

  return (
    <Modal show onClose={onClose} style={{ maxWidth: 400 }}>
      <section className="d-flex space-between">
        <h1 className="fs-6">{recipeName}</h1>
        <button className="delete" onClick={onClose} />
      </section>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          marginTop: "2rem",
        }}
      >
        <button
          className={cls("button", { "is-active": reschedulerOpen })}
          onClick={() => {
            setReschedulerOpen((val) => !val)
          }}
        >
          Reschedule
        </button>
        <Link to={to} className="button is-primary">
          View Recipe
        </Link>
      </div>

      {reschedulerOpen && (
        <div>
          <hr style={{ marginTop: "1.5rem" }} />
          <div className="mr-2" style={{ display: "grid", gridGap: "0.25rem" }}>
            <input
              value={toISODateString(localDate)}
              onChange={handleDateChange}
              type="date"
              className="mr-4 my-2"
              style={{
                border: "1px solid lightgray",
                borderRadius: 5,
                padding: "0.25rem",
              }}
            />
            <div>
              <span className="mr-1">next open</span>
              <select
                value={day}
                onChange={handleSelectChange}
                className="mr-2"
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
              <button onClick={handleFindNextOpen} disabled={findingNextOpen}>
                {!findingNextOpen ? "find" : "finding..."}
              </button>
            </div>
          </div>

          <div className="d-flex space-between align-items-center mt-2">
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
          </div>
        </div>
      )}
    </Modal>
  )
}
