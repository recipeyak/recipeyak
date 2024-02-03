import { addDays, addWeeks, format, parseISO } from "date-fns"
import React from "react"
import { DialogTrigger } from "react-aria-components"
import { Link } from "react-router-dom"

import { clx } from "@/classnames"
import { Avatar } from "@/components/Avatar"
import { Box } from "@/components/Box"
import { Button } from "@/components/Buttons"
import { Image } from "@/components/Image"
import { Modal } from "@/components/Modal"
import { Select } from "@/components/Select"
import { formatAbsoluteDate, toISODateString } from "@/date"
import { NoteTimeStamp } from "@/pages/recipe-detail/Notes"
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

function RecipeItem({
  sources,
  name,
  author,
  archived,
  to,
  createdAt,
  createdBy,
}: {
  sources: {
    url: string
    backgroundUrl: string | null
  } | null
  name: string
  author: string | null
  archived: boolean
  to: string
  createdBy: {
    readonly id: number | string
    readonly name: string
    readonly avatar_url: string
  } | null
  createdAt: string
}) {
  return (
    <Link to={to} className="flex cursor-pointer items-center gap-2">
      <Image
        sources={sources}
        width={60}
        height={60}
        rounded
        grayscale={archived}
        imgixFmt="large"
      />
      <div>
        <div
          className={clx(
            "line-clamp-1 text-ellipsis",
            archived && "line-through",
          )}
        >
          {name}
        </div>
        <div className="line-clamp-1 text-ellipsis text-sm">{author}</div>
        <div className="flex items-center gap-1">
          <Avatar avatarURL={createdBy?.avatar_url ?? null} size={20} />
          <div>
            {createdBy?.name} · <NoteTimeStamp created={createdAt} />
          </div>
        </div>
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
  archived,
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
  readonly archived: boolean
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
        <div className="flex flex-col gap-1">
          <RecipeItem
            to={to}
            sources={primaryImage}
            archived={archived}
            name={recipeName}
            author={recipeAuthor}
            createdAt={createdAt}
            createdBy={createdBy}
          />
        </div>

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
        // eslint-disable-next-line @typescript-eslint/consistent-type-assertions
        day: day as
          | "Sunday"
          | "Monday"
          | "Tuesday"
          | "Wednesday"
          | "Thursday"
          | "Friday"
          | "Saturday"
          | "Weekday"
          | "Weekend",
        now: parseISO(localDate),
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
  const handleSave = ({ on }: { on: Date }) => {
    scheduledRecipeUpdate.mutate({
      scheduledRecipeId: scheduledId,
      update: {
        on,
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

            <DialogTrigger>
              <Button size="small" variant="danger">
                Delete
              </Button>
              <Modal title="Delete Recipe">
                <div className="flex flex-col gap-2">
                  <div>Are you sure you want to delete '{recipeName}'?</div>
                  <div className="flex gap-2">
                    <Button>Cancel</Button>
                    <Button
                      variant="danger"
                      loading={scheduledRecipeDelete.isPending}
                      onClick={() => {
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
                      }}
                    >
                      {!scheduledRecipeDelete.isPending
                        ? "Delete"
                        : "Deleting..."}
                    </Button>
                  </div>
                </div>
              </Modal>
            </DialogTrigger>
          </div>

          {showCustom && (
            <>
              <input
                value={toISODateString(localDate)}
                onChange={handleDateChange}
                type="date"
                className="w-full rounded-md border border-solid border-[--color-border] p-1 text-base"
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
                      {!findNextOpen.isPending ? "Find" : "Finding..."}
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
              handleSave({ on: parseISO(localDate) })
            }}
            disabled={scheduledRecipeUpdate.isPending}
          >
            {!scheduledRecipeUpdate.isPending ? "Save" : "Saving..."}
          </Button>
        )}
      </Box>
    </Box>
  )
}
