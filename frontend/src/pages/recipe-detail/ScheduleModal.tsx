import React from "react"
import { Link } from "react-router-dom"

import * as api from "@/api"
import { isMobile } from "@/browser"
import Modal from "@/components/Modal"
import { toISODateString } from "@/date"
import { useDispatch, useSelector, useTeamId } from "@/hooks"
import { isOk } from "@/result"
import { scheduleURLFromTeamID } from "@/store/mapState"
import { setCalendarRecipe } from "@/store/reducers/calendar"

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
  const [isoDate, setIsoDate] = React.useState(toISODateString(new Date()))
  const [saving, setSaving] = React.useState(false)
  const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setIsoDate(e.target.value)
  }
  const dispatch = useDispatch()
  const teamId = useTeamId()
  const handleSave = () => {
    setSaving(true)
    void api.scheduleRecipe(recipeId, teamId, isoDate).then((res) => {
      if (isOk(res)) {
        dispatch(setCalendarRecipe(res.data))
        setSaving(false)
        onClose()
      }
      setSaving(false)
    })
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
            value={toISODateString(isoDate)}
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
          {!isMobile() ? (
            <Link to={scheduleUrl} className="text-small">
              open in schedule
            </Link>
          ) : (
            <div />
          )}
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
