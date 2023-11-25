import { addDays, addWeeks, format } from "date-fns"
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
import { styled } from "@/theme"
import { recipeURL } from "@/urls"

const ButtonContainer = styled(Box)`
  margin-top: auto;
  flex-direction: column;
  gap: 0.5rem;
`

const RecipeName = styled(Link)`
  font-size: 1rem;

  @media (max-width: 450px) {
    font-size: 1.25rem;
  }
`

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
            <RecipeName to={to}>{recipeName}</RecipeName>
          </Box>

          {reschedulerOpen && (
            <RescheduleSection
              onClose={onClose}
              date={date}
              teamID={teamID}
              scheduledId={scheduledId}
              recipeName={recipeName}
            />
          )}

          <hr className="my-2" />

          <TimelineEvent
            className="mb-2"
            enableLinking={false}
            event={{
              id: scheduledId,
              action: "scheduled",
              created_by: createdBy,
              created: createdAt,
              is_scraped: false,
            }}
          />
          <ButtonContainer>
            <Button
              size="normal"
              active={reschedulerOpen}
              onClick={() => {
                setReschedulerOpen((val) => !val)
              }}
            >
              Reschedule
            </Button>
            <Button size="normal" variant="primary" to={to}>
              View Recipe
            </Button>
          </ButtonContainer>
        </>
      }
    />
  )
}

function RescheduleSection({
  onClose,
  date,
  teamID,
  scheduledId,
  recipeName,
}: {
  onClose: () => void
  date: Date
  teamID: number
  scheduledId: number
  recipeName: string
}) {
  const [day, setDay] = React.useState(format(date, "EEEE"))
  const [localDate, setLocalDate] = React.useState(toISODateString(date))
  const [showCustom, setShowCustom] = React.useState(false)
  const scheduledRecipeDelete = useScheduledRecipeDelete()
  const scheduledRecipeUpdate = useScheduledRecipeUpdate()
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
  const handleSave = ({ on }: { on: string | number | Date }) => {
    scheduledRecipeUpdate.mutate({
      scheduledRecipeId: scheduledId,
      teamID,
      update: {
        on: toISODateString(on),
      },
    })
    // assume it will work
    onClose()
  }
  return (
    <Box dir="col" gap={2} mt={2}>
      <Box dir="col" gap={4} mt={2} mb={2}>
        <Box dir="col" gap={2}>
          <Box align="center" gap={2}>
            {(
              [
                [
                  "tomorrow",
                  () => {
                    handleSave({ on: addDays(date, 1) })
                  },
                ],
                [
                  "next week",
                  () => {
                    handleSave({ on: addWeeks(date, 1) })
                  },
                ],
                [
                  "custom",
                  () => {
                    setShowCustom((s) => !s)
                  },
                ],
              ] as const
            ).map(([label, onClick]) => {
              return (
                <Button
                  key={label}
                  size="small"
                  onClick={onClick}
                  active={label === "custom" && showCustom}
                  disabled={scheduledRecipeUpdate.isPending}
                >
                  {!scheduledRecipeUpdate.isPending ? label : "updating..."}
                </Button>
              )
            })}
          </Box>
          {showCustom && (
            <>
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
                    disabled={findNextOpen.isPending}
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
                      disabled={findNextOpen.isPending}
                    >
                      {!findNextOpen.isPending ? "find" : "finding..."}
                    </Button>
                  </div>
                </Box>
              </details>
            </>
          )}
        </Box>
      </Box>
      <Box space="between" align="center">
        <Button
          size="small"
          variant="danger"
          onClick={handleDelete}
          disabled={scheduledRecipeDelete.isPending}
        >
          {!scheduledRecipeDelete.isPending ? "delete" : "deleting..."}
        </Button>
        <Box gap={2}>
          <Button size="small" onClick={onClose}>
            dismiss
          </Button>
          {showCustom && (
            <Button
              size="small"
              variant="primary"
              onClick={() => {
                handleSave({ on: localDate })
              }}
              disabled={scheduledRecipeUpdate.isPending}
            >
              {!scheduledRecipeUpdate.isPending ? "save" : "saving..."}
            </Button>
          )}
        </Box>
      </Box>
    </Box>
  )
}
