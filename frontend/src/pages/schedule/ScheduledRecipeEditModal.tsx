import { addDays, addWeeks, format } from "date-fns"
import React from "react"
import { Link } from "react-router-dom"

import { Box } from "@/components/Box"
import { Button } from "@/components/Buttons"
import { Select } from "@/components/Forms"
import { Modal } from "@/components/Modal"
import { formatAbsoluteDate, toISODateString } from "@/date"
import { TimelineEvent } from "@/pages/recipe-detail/Notes"
import { useScheduledRecipeDelete } from "@/queries/scheduledRecipeDelete"
import { useScheduledRecipeFindNextOpen } from "@/queries/scheduledRecipeFindNextOpen"
import { useScheduledRecipeUpdate } from "@/queries/scheduledRecipeUpdate"
import { imgixFmt } from "@/url"
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

function RecipeItem({
  src,
  name,
  author,
  to,
}: {
  src: string
  name: string
  author: string | null
  to: string
}) {
  const cls =
    "h-[40px] w-[40px] rounded-md bg-[--color-background-empty-image] object-cover"
  return (
    <Link to={to} className="flex cursor-pointer items-center gap-2">
      {src !== "" ? <img src={src} className={cls} /> : <div className={cls} />}
      <div>
        <div className="line-clamp-1 text-ellipsis">{name}</div>
        <div className="line-clamp-1 text-ellipsis text-sm">{author}</div>
      </div>
    </Link>
  )
}

export function ScheduledRecipeEditModal({
  scheduledId,
  recipeName,
  recipeAuthor,
  primaryImage,
  recipeId,
  date,
  isOpen,
  onClose,
  createdAt,
  createdBy,
}: {
  readonly scheduledId: number
  readonly recipeId: number | string
  readonly recipeName: string
  readonly recipeAuthor: string | null
  readonly date: Date
  readonly isOpen: boolean
  readonly onClose: (_: boolean) => void
  readonly createdAt: string
  readonly createdBy: {
    readonly id: number | string
    readonly name: string
    readonly avatar_url: string
  } | null
  readonly primaryImage: {
    url: string
    backgroundUrl: string | null
  } | null
}) {
  const to = recipeURL(recipeId, recipeName)
  const [reschedulerOpen, setReschedulerOpen] = React.useState(false)

  const prettyDate = formatAbsoluteDate(date, { includeYear: true })
  return (
    <Modal
      isOpen={isOpen}
      onOpenChange={(change) => {
        onClose(change)
      }}
      title={prettyDate}
    >
      <div className="flex flex-col gap-2">
        <RecipeItem
          to={to}
          src={primaryImage?.url != null ? imgixFmt(primaryImage.url) : ""}
          name={recipeName}
          author={recipeAuthor}
        />

        {reschedulerOpen && (
          <RescheduleSection
            onClose={() => {
              onClose(false)
            }}
            date={date}
            scheduledId={scheduledId}
            recipeName={recipeName}
          />
        )}
        <hr className="my-1" />

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
        <div className="flex flex-col gap-2">
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
        </div>
      </div>
    </Modal>
  )
}

function RescheduleSection({
  onClose,
  date,
  scheduledId,
  recipeName,
}: {
  onClose: () => void
  date: Date
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
      update: {
        on: toISODateString(on),
      },
    })
    // assume it will work
    onClose()
  }
  return (
    <Box dir="col" gap={2}>
      <Box dir="col" gap={4} mt={2} mb={2}>
        <Box dir="col" gap={2}>
          <div className="flex flex-wrap justify-between gap-2">
            <div className="flex items-center gap-2">
              {(
                [
                  [
                    "Today",
                    () => {
                      handleSave({ on: new Date() })
                    },
                  ],
                  [
                    "Next Day",
                    () => {
                      handleSave({ on: addDays(date, 1) })
                    },
                  ],
                  [
                    "Next Week",
                    () => {
                      handleSave({ on: addWeeks(date, 1) })
                    },
                  ],
                  [
                    "Custom",
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
                    active={label === "Custom" && showCustom}
                    disabled={scheduledRecipeUpdate.isPending}
                  >
                    {!scheduledRecipeUpdate.isPending ? label : "Updating..."}
                  </Button>
                )
              })}
            </div>

            <Button
              size="small"
              variant="danger"
              onClick={handleDelete}
              disabled={scheduledRecipeDelete.isPending}
            >
              {!scheduledRecipeDelete.isPending ? "Delete" : "Deleting..."}
            </Button>
          </div>

          {showCustom && (
            <>
              <input
                value={toISODateString(localDate)}
                onChange={handleDateChange}
                type="date"
                className="w-full"
                // eslint-disable-next-line no-restricted-syntax
                style={{
                  border: "1px solid var(--color-border)",
                  borderRadius: 5,
                  padding: "0.25rem",
                }}
              />
              <details>
                <summary>shortcuts</summary>
                <Box gap={2} align="center">
                  <div className="text-[14px]">next open</div>
                  <Select
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
                  </Select>
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
      <Box space="end" align="center">
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
  )
}
