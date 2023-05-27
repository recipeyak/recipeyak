import { format } from "date-fns"
import React from "react"
import { Link } from "react-router-dom"

import { Box } from "@/components/Box"
import { Button } from "@/components/Buttons"
import { Modal } from "@/components/Modal"
import { formatAbsoluteDate, toISODateString } from "@/date"
import { TimelineEvent } from "@/pages/recipe-detail/Notes"
import { useScheduledRecipeDelete } from "@/queries/scheduledRecipeDelete"
import { useScheduledRecipeFindNextOpen } from "@/queries/scheduledRecipeFindNextOpen"
import { useScheduledRecipeUpdate } from "@/queries/scheduledRecipeUpdate"
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
  readonly teamID: number
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
  const scheduledRecipeDelete = useScheduledRecipeDelete()
  const scheduldRecipeUpdate = useScheduledRecipeUpdate()
  const findNextOpen = useScheduledRecipeFindNextOpen()

  const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setLocalDate(e.target.value)
  }
  const handleFindNextOpen = () => {
    findNextOpen.mutate(
      {
        teamID,
        day,
        now: localDate,
      },
      {
        onSuccess: (data) => {
          setLocalDate(data.date)
        },
      },
    )
  }
  const handleSelectChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setDay(e.target.value)
  }
  const handleDelete = () => {
    if (confirm(`Are you sure you want to delete '${recipeName}'?`)) {
      scheduledRecipeDelete.mutate(
        {
          scheduledRecipeId: scheduledId,
          teamId: teamID,
        },
        {
          onSuccess: () => {
            onClose()
          },
        },
      )
    }
  }
  const handleSave = () => {
    scheduldRecipeUpdate.mutate(
      {
        scheduledRecipeId: scheduledId,
        teamID,
        update: {
          on: toISODateString(localDate),
        },
      },
      {
        onSuccess: () => {
          onClose()
        },
      },
    )
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
              <Button
                size="small"
                active={reschedulerOpen}
                onClick={() => {
                  setReschedulerOpen((val) => !val)
                }}
              >
                Reschedule
              </Button>
              <Button size="small" variant="primary" to={to}>
                View Recipe
              </Button>
            </Box>
          </Box>

          {reschedulerOpen && (
            <Box dir="col" gap={2} mt={2}>
              <Box dir="col" gap={2}>
                <input
                  value={toISODateString(localDate)}
                  onChange={handleDateChange}
                  type="date"
                  className="w-100"
                  style={{
                    border: "1px solid var(--color-border)",
                    borderRadius: 5,
                    padding: "0.25rem",
                  }}
                />
                <details>
                  <summary>shortcuts</summary>
                  <Box gap={2} align="center">
                    <div className="fs-14px">next open</div>
                    <select
                      value={day}
                      onChange={handleSelectChange}
                      disabled={findNextOpen.isLoading}
                    >
                      {options.map((opt) => {
                        return (
                          <option value={opt} key={opt}>
                            {opt}
                          </option>
                        )
                      })}
                    </select>
                    <div>
                      <Button
                        size="small"
                        onClick={handleFindNextOpen}
                        disabled={findNextOpen.isLoading}
                      >
                        {!findNextOpen.isLoading ? "find" : "finding..."}
                      </Button>
                    </div>
                  </Box>
                </details>
              </Box>

              <Box space="between" align="center">
                <Button
                  size="small"
                  variant="danger"
                  onClick={handleDelete}
                  disabled={scheduledRecipeDelete.isLoading}
                >
                  {!scheduledRecipeDelete.isLoading ? "delete" : "deleting..."}
                </Button>
                <Box gap={2}>
                  <Button size="small" onClick={onClose}>
                    cancel
                  </Button>
                  <Button
                    size="small"
                    variant="primary"
                    onClick={handleSave}
                    disabled={scheduldRecipeUpdate.isLoading}
                  >
                    {!scheduldRecipeUpdate.isLoading ? "save" : "saving..."}
                  </Button>
                </Box>
              </Box>
            </Box>
          )}

          <hr className="my-2" />

          <TimelineEvent
            enableLinking={false}
            event={{
              id: scheduledId,
              action: "scheduled",
              created_by: createdBy,
              created: createdAt,
              is_scraped: false,
            }}
          />
        </>
      }
    />
  )
}
