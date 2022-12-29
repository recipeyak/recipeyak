import { UseQueryResult } from "@tanstack/react-query"
import { parseISO } from "date-fns"
import format from "date-fns/format"
import isAfter from "date-fns/isAfter"
import isBefore from "date-fns/isBefore"
import isValid from "date-fns/isValid"
import { groupBy } from "lodash-es"
import React, { useEffect, useRef } from "react"
import { connect } from "react-redux"

import {
  IGetShoppingListResponse,
  IIngredientItem,
  IQuantity,
  Unit,
} from "@/api"
import { classNames } from "@/classnames"
import { Box } from "@/components/Box"
import { Button } from "@/components/Buttons"
import { DateInput } from "@/components/Forms"
import { useShoppingListFetch } from "@/queries/shoppingListFetch"
import { ingredientByNameAlphabetical } from "@/sorters"
import {
  setSelectingEnd,
  setSelectingStart,
  setShopping,
} from "@/store/reducers/shoppinglist"
import { Dispatch, IState } from "@/store/store"
import { normalizeUnitsFracs } from "@/text"
import { toast } from "@/toast"

const selectElementText = (el: Element) => {
  const sel = window.getSelection()
  if (sel == null) {
    return
  }
  const range = document.createRange()
  range.selectNodeContents(el)
  sel.removeAllRanges()
  sel.addRange(range)
}

const removeSelection = () => {
  const sel = window.getSelection()
  if (sel == null) {
    return
  }
  sel.removeAllRanges()
}

function formatMonth(date: Date | null) {
  if (date == null) {
    return ""
  }
  return format(date, "yyyy-MM-dd")
}

interface IShoppingListItemProps {
  readonly item: [string, IIngredientItem]
  readonly isFirst: boolean
}

export function toQuantity(x: IQuantity): string {
  if (x.unit === Unit.NONE) {
    return x.quantity
  }
  if (x.unit === Unit.SOME) {
    return "some"
  }
  if (x.unit === Unit.UNKNOWN && x.unknown_unit == null) {
    return x.quantity
  }
  if (x.unit === Unit.UNKNOWN && x.unknown_unit != null) {
    return x.quantity + " " + x.unknown_unit
  }
  const unit = x.unit.toLowerCase()
  return x.quantity + " " + unit
}

function quantitiesToString(quantities: ReadonlyArray<IQuantity>): string {
  return quantities.map(toQuantity).join(" + ")
}

function ShoppingListItem({
  item: [name, { quantities }],
  isFirst,
}: IShoppingListItemProps) {
  // padding serves to prevent the button from appearing in front of text
  // we also use <section>s instead of <p>s to avoid extra new lines in Chrome
  const cls = classNames("text-small", { "mr-15": isFirst })

  const units = normalizeUnitsFracs(quantitiesToString(quantities))

  return (
    <section className={cls} key={name + units}>
      {units} {name}
    </section>
  )
}

interface IShoppingListContainerProps {
  readonly items: UseQueryResult<IGetShoppingListResponse, unknown>
}

const ShoppingListList = React.forwardRef<
  HTMLDivElement | null,
  IShoppingListContainerProps
>((props, ref) => {
  if (props.items.isError) {
    return <p>error fetching shoppinglist</p>
  }
  const loadingClass =
    props.items.isLoading || props.items.isRefetching
      ? "has-text-grey-light"
      : ""

  const items =
    props.items.isSuccess || props.items.isRefetchError
      ? Object.entries(props.items.data)
      : []

  const groups = Object.entries(groupBy(items, (x) => x[1]?.category))

  return (
    <div
      className={`box p-2 min-height-75px ${loadingClass}`}
      style={{
        overflowY: "auto",
        maxHeight: 425, // looks good on mobile & desktop
      }}
    >
      {props.items.isLoading ? (
        <div className="text-center">loading...</div>
      ) : (
        <div ref={ref} className="selectable">
          {groups.map(([groupName, values], groupIndex) => {
            values.sort((x, y) => ingredientByNameAlphabetical(x[0], y[0]))
            return (
              <div key={groupName}>
                {groupIndex > 0 && (
                  // ensure copying the list has a new line between categories
                  <section style={{ maxHeight: "0.5rem" }}>
                    <br />
                  </section>
                )}
                {values.map(([name, quantities], i) => {
                  if (quantities == null) {
                    return null
                  }
                  return (
                    <ShoppingListItem
                      key={name}
                      item={[name, quantities]}
                      isFirst={i === 0}
                    />
                  )
                })}
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
})

interface IShoppingListProps {
  readonly teamID: number | "personal"
  readonly startDay: Date
  readonly endDay: Date
  readonly setStartDay: (date: Date) => void
  readonly setEndDay: (date: Date) => void
  readonly setShopping: (bool: boolean) => void
}

function ShoppingList({
  teamID,
  startDay,
  endDay,
  setStartDay: propsSetStartDay,
  setEndDay: propsSetEndDay,
  setShopping,
}: IShoppingListProps) {
  const ref = useRef<HTMLDivElement>(null)
  const shoppingList = useShoppingListFetch({ startDay, endDay, teamID })

  useEffect(() => {
    setShopping(true)
    return () => {
      setShopping(false)
    }
  }, [setShopping])

  const handleSetStartDay = (e: React.ChangeEvent<HTMLInputElement>) => {
    const date = parseISO(e.target.value)
    if (!isValid(date)) {
      return
    }
    propsSetStartDay(date)
    if (isAfter(date, endDay)) {
      propsSetEndDay(date)
    }
  }

  const handleSetEndDay = (e: React.ChangeEvent<HTMLInputElement>) => {
    const date = parseISO(e.target.value)
    if (!isValid(date)) {
      return
    }
    propsSetEndDay(date)
    if (isBefore(date, startDay)) {
      propsSetStartDay(date)
    }
  }

  const handleCopyToClipboard = () => {
    const el = ref.current
    if (el == null) {
      return
    }
    selectElementText(el)
    document.execCommand("copy")
    removeSelection()
    toast("Shopping list copied to clipboard!")
  }

  return (
    <Box dir="col" gap={2} w={100}>
      <Box dir="col" gap={2} w={100}>
        <Box gap={2} w={100} align="center">
          <DateInput
            onChange={handleSetStartDay}
            placeholder="from"
            value={formatMonth(startDay)}
          />
          <h2 className="fs-4">→</h2>
          <DateInput
            onChange={handleSetEndDay}
            placeholder="to"
            value={formatMonth(endDay)}
          />
        </Box>
        <Button size="small" onClick={handleCopyToClipboard}>
          Copy to Clipboard
        </Button>
      </Box>
      <ShoppingListList items={shoppingList} ref={ref} />
    </Box>
  )
}

function mapStateToProps(state: IState) {
  return {
    startDay: state.shoppinglist.startDay,
    endDay: state.shoppinglist.endDay,
  }
}

const mapDispatchToProps = (dispatch: Dispatch) => ({
  setStartDay: (date: Date) => dispatch(setSelectingStart(date)),
  setEndDay: (date: Date) => dispatch(setSelectingEnd(date)),
  setShopping: (value: boolean) => dispatch(setShopping(value)),
})

export default connect(mapStateToProps, mapDispatchToProps)(ShoppingList)
