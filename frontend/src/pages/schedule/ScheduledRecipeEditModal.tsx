import {
  addDays,
  addWeeks,
  format,
  isSameDay,
  isSameYear,
  parseISO,
} from "date-fns"
import React from "react"
import { DialogTrigger } from "react-aria-components"
import { Link } from "react-router-dom"

import { clx } from "@/classnames"
import { Avatar } from "@/components/Avatar"
import { Button } from "@/components/Buttons"
import { Image } from "@/components/Image"
import { Modal } from "@/components/Modal"
import { formatAbsoluteDate, toISODateString } from "@/date"
import { NoteTimeStamp } from "@/pages/recipe-detail/NoteTimestamp"
import { useScheduledRecipeDelete } from "@/queries/useScheduledRecipeDelete"
import { useScheduledRecipeUpdate } from "@/queries/useScheduledRecipeUpdate"
import { recipeURL } from "@/urls"

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
        size="small"
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

function getDateOption(
  label: string,
  on: Date,
  handleSave: (args: { on: Date }) => void,
) {
  let formatStr = "EEE MMM d"
  if (!isSameYear(on, new Date())) {
    formatStr += ", yyyy"
  }
  return [
    label + " · " + format(on, formatStr),
    () => {
      handleSave({ on })
    },
  ] as const
}

function getNextDayOption(
  date: Date,
  handleSave: (args: { on: Date }) => void,
) {
  const nextDay = addDays(date, 1)
  const tomorrow = addDays(new Date(), 1)
  const label = isSameDay(nextDay, tomorrow) ? "Tomorrow" : "Next Day"
  return getDateOption(label, nextDay, handleSave)
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
  const [localDate, setLocalDate] = React.useState(toISODateString(date))
  const [showCustom, setShowCustom] = React.useState(false)
  const scheduledRecipeDelete = useScheduledRecipeDelete()
  const scheduledRecipeUpdate = useScheduledRecipeUpdate()
  const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setLocalDate(e.target.value)
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
    <div className="flex flex-col gap-2">
      <div className="my-2 flex flex-col gap-4">
        <div className="flex flex-col gap-2">
          <div className="flex flex-col flex-wrap justify-between gap-3">
            <div className="flex flex-col items-center gap-2">
              {(
                [
                  getDateOption("Today", new Date(), handleSave),
                  getNextDayOption(date, handleSave),
                  getDateOption("Next Week", addWeeks(date, 1), handleSave),
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
                    onClick={onClick}
                    className="w-full grow"
                    active={label === "Custom" && showCustom}
                    disabled={scheduledRecipeUpdate.isPending}
                  >
                    {!scheduledRecipeUpdate.isPending ? label : "Updating..."}
                  </Button>
                )
              })}
              {showCustom && (
                <>
                  {/* eslint-disable-next-line react/forbid-elements */}
                  <input
                    value={toISODateString(localDate)}
                    onChange={handleDateChange}
                    type="date"
                    className="w-full rounded-md border border-solid border-[--color-border] p-1 text-base"
                  />
                  <Button
                    variant="primary"
                    onClick={() => {
                      handleSave({ on: parseISO(localDate) })
                    }}
                    className="w-full grow"
                    disabled={scheduledRecipeUpdate.isPending}
                  >
                    {!scheduledRecipeUpdate.isPending
                      ? "Update Schedule"
                      : "Updating Schedule..."}
                  </Button>
                </>
              )}
            </div>

            <DialogTrigger>
              <Button>Remove from Schedule</Button>
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
                        ? "Remove from Schedule"
                        : "Removing from Schedule..."}
                    </Button>
                  </div>
                </div>
              </Modal>
            </DialogTrigger>
          </div>
        </div>
      </div>
    </div>
  )
}
