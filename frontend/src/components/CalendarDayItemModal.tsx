import React from "react"
import { Link } from "react-router-dom"
import { toISODateString } from "@/date"
import { recipeURL } from "@/urls"
import Modal from "@/components/Modal"
import { format } from "date-fns"
import * as api from "@/api"
import { isOk } from "@/result"
import { useDispatch } from "@/hooks"
import { moveCalendarRecipe } from "@/store/reducers/calendar"

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
  id,
  recipeName,
  teamID,
  date,
  onClose,
}: {
  readonly id: number
  readonly teamID: TeamID
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
    api.findNextOpen({ teamID, day, now: localDate }).then(res => {
      if (isOk(res)) {
        console.log(res.data)
        console.log(res.data.date, localDate)
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
      api.deleteScheduledRecipe(id, teamID).then(() => {
        setDeleting(false)
        onClose()
      })
    }
  }
  const handleSave = () => {
    setSaving(true)
    api
      .updateScheduleRecipe(id, teamID, { on: toISODateString(localDate) })
      .then(res => {
        if (isOk(res)) {
          dispatch(moveCalendarRecipe({ id, to: toISODateString(res.data.on) }))
          setSaving(false)
          onClose()
        }
        setSaving(false)
      })
  }

  const to = recipeURL(id, recipeName)

  return (
    <Modal show onClose={onClose} style={{ maxWidth: 400 }}>
      <section className="d-flex space-between">
        <h1 className="fs-4 bold">Edit Scheduled Recipe</h1>
        <button className="delete" onClick={onClose} />
      </section>

      <div className="mr-2" style={{ display: "grid", gridGap: "0.25rem" }}>
        <Link to={to} className="text-underline">
          {recipeName}
        </Link>
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
            disabled={findingNextOpen}>
            {options.map(opt => {
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
    </Modal>
  )
}
