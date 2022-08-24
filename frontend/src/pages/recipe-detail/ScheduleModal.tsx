import React from "react"
import { Link } from "react-router-dom"

import Modal from "@/components/Modal"
import { toISODateString } from "@/date"
import { useSelector } from "@/hooks"
import { scheduleURLFromTeamID } from "@/store/mapState"

function useScheduleUrl(recipeId: number) {
  return useSelector(scheduleURLFromTeamID) + `?recipeId=${recipeId}`
}

export function ScheduleModal({
  recipeName,
  recipeId,
  onClose,
}: {
  readonly recipeId: number
  readonly recipeName: string
  readonly onClose: () => void
}) {
  const [localDate, setLocalDate] = React.useState(toISODateString(new Date()))
  const [saving, setSaving] = React.useState(false)
  const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setLocalDate(e.target.value)
  }
  const handleSave = () => {
    setSaving(true)
  }

  const scheduleUrl = useScheduleUrl(recipeId)

  return (
    <Modal show onClose={onClose} style={{ maxWidth: 400 }}>
      <section className="d-flex space-between">
        <h1 className="fs-5">Schedule: {recipeName}</h1>
        <button className="delete" onClick={onClose} />
      </section>

      <div>
        <div className="mr-2" style={{ display: "grid", gridGap: "0.25rem" }}>
          <input
            value={toISODateString(localDate)}
            onChange={handleDateChange}
            type="date"
            className="mr-4 mt-2"
            style={{
              border: "1px solid lightgray",
              borderRadius: 5,
              padding: "0.25rem",
            }}
          />
        </div>

        <div className="d-flex justify-space-between align-items-center mt-2">
          <Link to={scheduleUrl} className="text-small">
            open in schedule
          </Link>
          <div className="align-items-center d-flex">
            <button className="mr-2" onClick={onClose}>
              cancel
            </button>
            <button onClick={handleSave} disabled={saving}>
              {!saving ? "schedule" : "scheduling..."}
            </button>
          </div>
        </div>
      </div>
    </Modal>
  )
}
