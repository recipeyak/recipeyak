import {
  addDays,
  addWeeks,
  differenceInCalendarDays,
  format,
  isSameDay,
  isSameYear,
  parseISO,
} from "date-fns"
import { Trash2 } from "lucide-react"
import React from "react"
import { DialogTrigger } from "react-aria-components"
import { Link } from "react-router-dom"

import { clx } from "@/classnames"
import { Avatar } from "@/components/Avatar"
import { Badge } from "@/components/Badge"
import { Button } from "@/components/Buttons"
import { DateInput } from "@/components/DateInput"
import { Image } from "@/components/Image"
import { Modal } from "@/components/Modal"
import { toISODateString } from "@/date"
import { NoteTimeStamp } from "@/pages/recipe-detail/NoteTimestamp"
import { useScheduledRecipeDelete } from "@/queries/useScheduledRecipeDelete"
import { useScheduledRecipeUpdate } from "@/queries/useScheduledRecipeUpdate"
import { recipeURL } from "@/urls"

function formatScheduleDate(date: Date): string {
  return format(
    date,
    isSameYear(date, new Date()) ? "EEE, MMM d" : "EEE, MMM d, yyyy",
  )
}

function formatRelativeDays(date: Date): string {
  const days = differenceInCalendarDays(date, new Date())
  if (days === 0) {
    return "Today"
  }
  if (days === 1) {
    return "Tomorrow"
  }
  if (days === -1) {
    return "Yesterday"
  }
  return days < 0 ? `${-days} days ago` : `in ${days} days`
}

function RecipeItem({
  sources,
  name,
  author,
  archived,
  to,
  date,
}: {
  sources: {
    url: string
    backgroundUrl: string | null
  } | null
  name: string
  author: string | null
  archived: boolean
  to: string
  date: Date
}) {
  const isOverdue = differenceInCalendarDays(date, new Date()) < 0
  return (
    <Link to={to} className="flex cursor-pointer items-center gap-3">
      <Image
        sources={sources}
        width={80}
        height={80}
        rounded
        grayscale={archived}
        size="small"
      />
      <div className="min-w-0">
        <div
          className={clx(
            "line-clamp-2 text-lg font-medium leading-tight",
            archived && "line-through",
          )}
        >
          {name}
        </div>
        <div className="line-clamp-1 text-ellipsis text-sm text-[--color-text-muted]">
          {author}
        </div>
        <div className="mt-1 flex flex-wrap items-center gap-2 text-sm">
          {isOverdue && <Badge status="error">Overdue</Badge>}
          <span>
            {formatScheduleDate(date)} · {formatRelativeDays(date)}
          </span>
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

  return (
    <Modal
      isOpen={isOpen}
      onOpenChange={(change) => {
        onClose(change)
      }}
      title={
        Scheduled recipe
      }
    >
      <div className="mt-2 flex flex-col gap-3">
        <RecipeItem
          to={to}
          sources={primaryImage}
          archived={archived}
          name={recipeName}
          author={recipeAuthor}
          date={date}
        />
        {createdBy != null && (
          <div className="flex items-center gap-2 text-xs text-[--color-text-muted]">
            <Avatar avatarURL={createdBy.avatar_url} size={20} />
            <span>
              Added by{" "}
              <span className="font-medium text-[--color-text]">
                {createdBy.name}
              </span>{" "}
              · <NoteTimeStamp created={createdAt} />
            </span>
          </div>
        )}

        <hr className="my-1 border-[--color-border]" />

        <RescheduleSection
          onClose={() => {
            onClose(false)
          }}
          date={date}
          scheduledId={scheduledId}
        />

        <div className="mt-3 flex items-center justify-between gap-2">
          <RemoveButton
            scheduledId={scheduledId}
            recipeName={recipeName}
            onClose={() => {
              onClose(false)
            }}
          />
          <Button size="normal" variant="primary" to={to}>
            View recipe →
          </Button>
        </div>
      </div>
    </Modal>
  )
}

function DateOption({
  label,
  detail,
  onClick,
  active,
  disabled,
}: {
  label: string
  detail: string
  onClick: () => void
  active?: boolean
  disabled?: boolean
}) {
  return (
    <Button
      onClick={onClick}
      active={active}
      disabled={disabled}
      className="flex-col !py-2"
    >
      <span>{label}</span>
      <span className="text-xs font-normal text-[--color-text-muted]">
        {detail}
      </span>
    </Button>
  )
}

function RescheduleSection({
  onClose,
  date,
  scheduledId,
}: {
  onClose: () => void
  date: Date
  scheduledId: number
}) {
  const today = new Date()
  const [localDate, setLocalDate] = React.useState(toISODateString(date))
  const [showCustom, setShowCustom] = React.useState(false)
  const scheduledRecipeUpdate = useScheduledRecipeUpdate()
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
  const options = [
    { label: "Today", on: today },
    { label: "Tomorrow", on: addDays(today, 1) },
    { label: "Next week", on: addWeeks(today, 1) },
  ]
  return (
    <div className="flex flex-col gap-2">
      <div className="text-xs font-semibold uppercase tracking-wide text-[--color-text-muted]">
        Move to
      </div>
      <div className="grid grid-cols-2 gap-2">
        {options.map(({ label, on }) => {
          return (
            <DateOption
              key={label}
              label={label}
              detail={format(
                on,
                isSameYear(on, today) ? "EEE MMM d" : "EEE MMM d, yyyy",
              )}
              disabled={scheduledRecipeUpdate.isPending || isSameDay(on, date)}
              onClick={() => {
                handleSave({ on })
              }}
            />
          )
        })}
        <DateOption
          label="Pick a date…"
          detail="Calendar"
          active={showCustom}
          disabled={scheduledRecipeUpdate.isPending}
          onClick={() => {
            setShowCustom((s) => !s)
          }}
        />
      </div>
      {showCustom && (
        <div className="flex gap-2">
          <DateInput
            value={localDate}
            min={toISODateString(today)}
            autoFocus
            onChange={(e) => {
              setLocalDate(e.target.value)
            }}
          />
          <Button
            variant="primary"
            disabled={
              scheduledRecipeUpdate.isPending ||
              localDate === "" ||
              isSameDay(parseISO(localDate), date)
            }
            onClick={() => {
              handleSave({ on: parseISO(localDate) })
            }}
          >
            Move
          </Button>
        </div>
      )}
    </div>
  )
}

function RemoveButton({
  scheduledId,
  recipeName,
  onClose,
}: {
  scheduledId: number
  recipeName: string
  onClose: () => void
}) {
  const scheduledRecipeDelete = useScheduledRecipeDelete()
  return (
    <DialogTrigger>
      <Button className="gap-1 !border-transparent !bg-transparent !text-[--color-danger] hover:!bg-[--color-normal-hover-bg]">
        <Trash2 size={16} />
        Remove
      </Button>
      <Modal title="Remove from schedule">
        <div className="flex flex-col gap-2">
          <div>Remove '{recipeName}' from the schedule?</div>
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
                ? "Remove from schedule"
                : "Removing from schedule..."}
            </Button>
          </div>
        </div>
      </Modal>
    </DialogTrigger>
  )
}
