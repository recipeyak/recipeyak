import { DragObjectWithType, DropTargetMonitor } from "react-dnd"

export const enum DragDrop {
  RECIPE = "RECIPE",
  CAL_RECIPE = "CAL_RECIPE",
  STEP = "STEP",
  INGREDIENT = "INGREDIENT"
}

export const handleDndHover = ({
  ref,
  index,
  move
}: {
  readonly ref: React.RefObject<HTMLElement>
  readonly index: number
  readonly move?: ({
    from,
    to
  }: {
    readonly from: number
    readonly to: number
  }) => void
}) => (_item: DragObjectWithType, monitor: DropTargetMonitor) => {
  if (!ref.current) {
    return
  }

  // tslint:disable-next-line:no-unsafe-any
  const dragIndex: number = monitor.getItem().index
  const hoverIndex = index

  // Don't replace items with themselves
  if (dragIndex === hoverIndex) {
    return
  }

  // Determine rectangle on screen
  const el = ref.current
  const hoverBoundingRect = el.getBoundingClientRect()

  // Get vertical middle
  const hoverMiddleY = (hoverBoundingRect.bottom - hoverBoundingRect.top) / 2

  // Determine mouse position
  const clientOffset = monitor.getClientOffset()
  if (clientOffset == null) {
    return
  }

  // Get pixels to the top
  const hoverClientY = clientOffset.y - hoverBoundingRect.top

  // Only perform the move when the mouse has crossed half of the items height
  // When dragging downwards, only move when the cursor is below 50%
  // When dragging upwards, only move when the cursor is above 50%

  // Dragging downwards
  if (dragIndex < hoverIndex && hoverClientY < hoverMiddleY) {
    return
  }

  // Dragging upwards
  if (dragIndex > hoverIndex && hoverClientY > hoverMiddleY) {
    return
  }

  // Time to actually perform the action
  move?.({ from: dragIndex, to: hoverIndex })

  // Note: we're mutating the monitor item here!
  // Generally it's better to avoid mutations,
  // but it's good here for the sake of performance
  // to avoid expensive index searches.
  // tslint:disable-next-line:no-unsafe-any
  monitor.getItem().index = hoverIndex
}
