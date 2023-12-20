import React, { useState } from "react"
import { useDrag } from "react-dnd"
import { Link } from "react-router-dom"

import { clx } from "@/classnames"
import { isInsideChangeWindow } from "@/date"
import { DragDrop } from "@/dragDrop"
import { CalendarDayItemModal } from "@/pages/schedule/CalendarDayItemModal"
import { recipeURL } from "@/urls"
import { useGlobalEvent } from "@/useGlobalEvent"

export interface ICalendarItemProps {
  readonly remove: () => void
  readonly date: Date
  readonly recipeID: number | string
  readonly recipeName: string
  readonly scheduledId: number
  readonly teamID: number
  readonly createdAt: string
  readonly createdBy: {
    readonly id: number | string
    readonly name: string
    readonly avatar_url: string
  } | null
}

export function CalendarItem({
  date,
  remove,
  recipeName,
  recipeID,
  teamID,
  scheduledId,
  createdAt,
  createdBy,
}: ICalendarItemProps) {
  const ref = React.useRef<HTMLDivElement>(null)
  const [show, setShow] = useState(false)

  const handleKeyPress = (e: KeyboardEvent) => {
    if (!ref.current?.matches(":hover")) {
      return
    }

    if (!isInsideChangeWindow(date)) {
      return
    }

    if (e.key === "#" || e.key === "Delete") {
      remove()
    }
  }

  const dragItem: ICalendarDragItem = {
    type: DragDrop.CAL_RECIPE,
    recipeID,
    scheduledId,
    date,
  }

  const [{ isDragging }, drag] = useDrag({
    type: DragDrop.CAL_RECIPE,
    item: dragItem,
    // don't do anything when on drop
    end: () => {},
    collect: (monitor) => {
      return {
        isDragging: monitor.isDragging(),
      }
    },
  })

  const visibility =
    isDragging && isInsideChangeWindow(date) ? "hidden" : "visible"

  useGlobalEvent({ keyUp: handleKeyPress })

  drag(ref)

  return (
    <>
      <div
        ref={ref}
        className={clx(
          "mb-[var(--margin-calendar-item-bottom)] last:mb-0",
          visibility === "visible" ? "visible" : "invisible",
        )}
      >
        <Link
          className="block break-words rounded-md p-1.5 text-sm font-semibold leading-tight"
          to={recipeURL(recipeID, recipeName)}
          onClick={(e) => {
            if (e.shiftKey || e.metaKey) {
              return
            }
            e.preventDefault()
            setShow(true)
          }}
        >
          {recipeName}
        </Link>
      </div>
      {show ? (
        <CalendarDayItemModal
          scheduledId={scheduledId}
          createdAt={createdAt}
          createdBy={createdBy}
          teamID={teamID}
          recipeName={recipeName}
          recipeId={recipeID}
          date={date}
          onClose={() => {
            setShow(false)
          }}
        />
      ) : null}
    </>
  )
}

export interface ICalendarDragItem
  extends Pick<ICalendarItemProps, "recipeID" | "scheduledId" | "date"> {
  readonly type: DragDrop.CAL_RECIPE
}
