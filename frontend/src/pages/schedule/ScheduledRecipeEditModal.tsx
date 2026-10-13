import {
  addDays,
  addWeeks,
  format,
  isSameDay,
  isSameYear,
  max,
  parseISO,
} from "date-fns"
import { CalendarDays, Trash2 } from "lucide-react"
import React from "react"
import { Link } from "react-router-dom"

import { clx } from "@/classnames"
import { Avatar } from "@/components/Avatar"
import { Button } from "@/components/Buttons"
import { DateInput } from "@/components/DateInput"
import { Image } from "@/components/Image"
import { Modal } from "@/components/Modal"
import { toISODateString } from "@/date"
import { NoteTimeStamp } from "@/pages/recipe-detail/NoteTimestamp"
import { useScheduleRecipeCreate } from "@/queries/useScheduledRecipeCreate"
import { useScheduledRecipeDelete } from "@/queries/useScheduledRecipeDelete"
import { useScheduledRecipeUpdate } from "@/queries/useScheduledRecipeUpdate"
import { toast } from "@/toast"
import { recipeURL } from "@/urls"

function formatScheduleDate(date: Date): string {
  return format(
    date,
    isSameYear(date, new Date()) ? "EEE, MMM d" : "EEE, MMM d, yyyy",
  )
}

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
  createdAt: string
  createdBy: {
    readonly id: number | string
    readonly name: string
    readonly avatar_url: string
  } | null
}) {
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
            "line-clamp-2 text-lg leading-tight",
            archived && "line-through",
          )}
        >
          {name}
        </div>
        <div className="line-clamp-1 text-ellipsis text-sm text-[--color-text-muted]">
          {author}
        </div>
        {createdBy != null && (
          <div className="mt-1.5 flex items-center gap-1.5 text-sm text-[--color-text-muted]">
            <Avatar avatarURL={createdBy.avatar_url} size={20} />
            <span>
              {createdBy.name} · <NoteTimeStamp created={createdAt} />
            </span>
          </div>
        )}
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
      title={formatScheduleDate(date)}
    >
      <div className="mt-4 flex flex-col gap-6">
        <RecipeItem
          to={to}
          sources={primaryImage}
          archived={archived}
          name={recipeName}
          author={recipeAuthor}
          createdAt={createdAt}
          createdBy={createdBy}
        />

        <RescheduleSection
          onClose={() => {
            onClose(false)
          }}
          date={date}
          scheduledId={scheduledId}
        />

        <div className="flex flex-col items-center gap-2">
          <Button size="normal" variant="primary" to={to} className="w-full">
            View Recipe
          </Button>
          <RemoveButton
            scheduledId={scheduledId}
            recipeId={recipeId}
            recipeName={recipeName}
            date={date}
            onClose={() => {
              onClose(false)
            }}
          />
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
  label: React.ReactNode
  detail?: string
  onClick: () => void
  active?: boolean
  disabled?: boolean
}) {
  return (
    <Button
      onClick={onClick}
      active={active}
      disabled={disabled}
      className={clx(
        "flex-col !border-transparent !py-2 !font-normal",
        !disabled &&
          (active
            ? "!bg-[--color-normal-active-bg]"
            : "!bg-[--color-normal-hover-bg] hover:!bg-[--color-normal-active-bg]"),
      )}
    >
      <span className="flex items-center gap-1.5 text-[--color-text]">
        {label}
      </span>
      {detail != null && (
        <span className="text-sm text-[--color-text-muted]">{detail}</span>
      )}
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
  const [localDate, setLocalDate] = React.useState(
    toISODateString(max([date, today])),
  )
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
    { label: "Next Week", on: addWeeks(today, 1) },
  ]
  return (
    <div className="flex flex-col gap-2">
      <div className="text-sm text-[--color-text-muted]">Move to</div>
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
          label={
            <>
              <CalendarDays size={16} />
              Pick a Date…
            </>
          }
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

function UndoRemoveToast({
  toastId,
  recipeId,
  recipeName,
  date,
}: {
  toastId: string
  recipeId: number | string
  recipeName: string
  date: Date
}) {
  // Rendered by the app's Toaster so it outlives the modal.
  const scheduledRecipeCreate = useScheduleRecipeCreate()
  return (
    <div className="flex items-center gap-3">
      <span className="line-clamp-2 min-w-0">Removed {recipeName}</span>
      <Button
        size="small"
        className="shrink-0"
        onClick={() => {
          toast.dismiss(toastId)
          scheduledRecipeCreate.mutate({
            recipeID: Number(recipeId),
            recipeName,
            on: toISODateString(date),
          })
        }}
      >
        Undo
      </Button>
    </div>
  )
}

function RemoveButton({
  scheduledId,
  recipeId,
  recipeName,
  date,
  onClose,
}: {
  scheduledId: number
  recipeId: number | string
  recipeName: string
  date: Date
  onClose: () => void
}) {
  const scheduledRecipeDelete = useScheduledRecipeDelete()
  return (
    <Button
      size="normal"
      className="gap-1 !border-transparent !bg-transparent !text-sm !font-normal !text-[--color-text-muted] hover:!text-[--color-danger]"
      onClick={() => {
        scheduledRecipeDelete.mutate({ scheduledRecipeId: scheduledId })
        onClose()
        toast(
          (t) => (
            <UndoRemoveToast
              toastId={t.id}
              recipeId={recipeId}
              recipeName={recipeName}
              date={date}
            />
          ),
          { duration: 6000 },
        )
      }}
    >
      <Trash2 size={14} />
      Remove from Schedule
    </Button>
  )
}
