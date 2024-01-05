import React, { useState } from "react"
import { useDrag } from "react-dnd"
import { Link } from "react-router-dom"

import { clx } from "@/classnames"
import { Image } from "@/components/Image"
import { isInsideChangeWindow } from "@/date"
import { DragDrop } from "@/dragDrop"
import { CalendarDayItemModal } from "@/pages/schedule/CalendarDayItemModal"
import { imgixFmt } from "@/url"
import { recipeURL } from "@/urls"
import { useGlobalEvent } from "@/useGlobalEvent"

function RecipeLink({
  name,
  id,
  onClick,
}: {
  readonly id: number | string
  readonly name: string
  readonly onClick: (e: React.MouseEvent) => void
}) {
  const to = recipeURL(id, name)
  return (
    <Link
      className="line-clamp-3 text-ellipsis break-words rounded-md text-sm font-semibold leading-tight focus-visible:outline focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-[rgb(47,129,247)]"
      to={to}
      onClick={onClick}
    >
      {name}
    </Link>
  )
}

interface ICalendarItemProps {
  readonly remove: () => void
  readonly date: Date
  readonly recipeID: number | string
  readonly recipeName: string
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
  recipeID,
  primaryImage,
  scheduledId,
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
      <li
        ref={ref}
        className={clx(
          "flex items-center gap-2",
          visibility === "visible" ? "visible" : "invisible",
        )}
      >
        <Image
          width={25}
          height={25}
          sources={
            primaryImage && {
              url: imgixFmt(primaryImage.url),
              backgroundUrl: primaryImage.backgroundUrl,
            }
          }
          rounded
        />

        <RecipeLink
          name={recipeName}
          id={recipeID}
          onClick={(e) => {
            if (e.shiftKey || e.metaKey) {
              return
            }
            e.preventDefault()
            setShow(true)
          }}
        />
      </li>
      <CalendarDayItemModal
        isOpen={show}
        scheduledId={scheduledId}
        createdAt={createdAt}
        createdBy={createdBy}
        recipeName={recipeName}
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
