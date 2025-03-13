import React, { useState } from "react"
import { useDrag, useFocusVisible } from "react-aria"
import { Link } from "react-router-dom"

import { clx } from "@/classnames"
import { Image } from "@/components/Image"
import { isInsideChangeWindow } from "@/date"
import { DragDrop } from "@/dragDrop"
import { ScheduledRecipeEditModal } from "@/pages/schedule/ScheduledRecipeEditModal"
import { recipeURL } from "@/urls"
import { useGlobalEvent } from "@/useGlobalEvent"

interface ICalendarItemProps {
  readonly remove: () => void
  readonly date: Date
  readonly recipeID: number | string
  readonly recipeName: string
  readonly recipeAuthor: string | null
  readonly archived: boolean
  readonly scheduledId: number
  readonly createdAt: string
  readonly createdBy: {
    readonly id: number | string
    readonly name: string
    readonly avatar_url: string
  } | null
  readonly primaryImage: {
    readonly url: string
    readonly backgroundUrl: string | null
  } | null
}

export function CalendarItem({
  date,
  remove,
  recipeName,
  recipeAuthor,
  recipeID,
  primaryImage,
  scheduledId,
  archived,
  createdAt,
  createdBy,
}: ICalendarItemProps) {
  const ref = React.useRef<HTMLLIElement>(null)
  const [show, setShow] = useState(false)

  const handleKeyPress = (e: KeyboardEvent) => {
    if (!ref.current?.matches(":hover")) {
      return
    }

    if (!isInsideChangeWindow(date)) {
      return
    }

    if (e.key === "#" || e.key === "Delete" || e.key === "Backspace") {
      remove()
    }
  }

  const dragItem: ICalendarDragItem = {
    type: DragDrop.CAL_RECIPE,
    recipeID,
    scheduledId,
    date,
  }

  const { dragProps, isDragging } = useDrag({
    getItems() {
      return [
        {
          "recipeyak/scheduled-recipe": JSON.stringify(dragItem),
        },
      ]
    },
  })

  const visibility =
    isDragging && isInsideChangeWindow(date) ? "hidden" : "visible"

  useGlobalEvent({ keyUp: handleKeyPress })

  const { isFocusVisible } = useFocusVisible()

  return (
    <>
      <li
        ref={ref}
        {...dragProps}
        className={clx(visibility === "visible" ? "visible" : "invisible")}
      >
        <Link
          className={clx(
            "flex w-full items-center gap-2 rounded-md",
            // only want to show focus outline on devices with a keyboard aka not most phones
            isFocusVisible
              ? "focus-visible:outline focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-[rgb(47,129,247)]"
              : "outline-none",
          )}
          to={recipeURL(recipeID, recipeName)}
          onClick={(e) => {
            if (e.shiftKey || e.metaKey) {
              return
            }
            e.preventDefault()
            setShow(true)
          }}
        >
          <Image
            width={25}
            height={25}
            size="small"
            sources={primaryImage}
            grayscale={archived}
            rounded
          />
          <div
            className={clx(
              "line-clamp-3 text-ellipsis break-words text-sm font-semibold leading-tight",
              archived && "line-through",
            )}
          >
            {recipeName}
          </div>
        </Link>
      </li>
      <ScheduledRecipeEditModal
        isOpen={show}
        scheduledId={scheduledId}
        createdAt={createdAt}
        createdBy={createdBy}
        recipeName={recipeName}
        recipeAuthor={recipeAuthor}
        archived={archived}
        primaryImage={primaryImage}
        recipeId={recipeID}
        date={date}
        onClose={(change) => {
          setShow(change)
        }}
      />
    </>
  )
}

export interface ICalendarDragItem
  extends Pick<ICalendarItemProps, "recipeID" | "scheduledId" | "date"> {
  readonly type: DragDrop.CAL_RECIPE
}
