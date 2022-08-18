import addMonths from "date-fns/addMonths"
import format from "date-fns/format"
import isAfter from "date-fns/isAfter"
import isBefore from "date-fns/isBefore"
import isValid from "date-fns/isValid"
import subMonths from "date-fns/subMonths"
import { groupBy } from "lodash-es"
import React, { useEffect, useRef, useState } from "react"
import { connect } from "react-redux"

import type {
  IGetShoppingListResponse,
  IIngredientItem,
  IQuantity,
} from "@/api"
import { Unit } from "@/api"
import { classNames } from "@/classnames"
import { Button } from "@/components/Buttons"
import DateRangePicker from "@/components/DateRangePicker/DateRangePicker"
import { DateInput } from "@/components/Forms"
import GlobalEvent from "@/components/GlobalEvent"
import { ingredientByNameAlphabetical } from "@/sorters"
import {
  setSelectingEnd,
  setSelectingStart,
} from "@/store/reducers/shoppinglist"
import type { IState } from "@/store/store"
import type { Dispatch } from "@/store/thunks"
import {
  fetchingShoppingListAsync,
  reportBadMergeAsync,
  showNotificationWithTimeoutAsync,
} from "@/store/thunks"
import { normalizeUnitsFracs } from "@/text"
import type { WebData } from "@/webdata"
import {
  isFailure,
  isLoading,
  isRefetching,
  isSuccessOrRefetching,
} from "@/webdata"

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
  readonly items: WebData<IGetShoppingListResponse>
  readonly sendToast: (message: string) => void
}

class ShoppingListList extends React.Component<IShoppingListContainerProps> {
  shoppingList = React.createRef<HTMLDivElement>()

  handleSelectList = () => {
    const el = this.shoppingList.current
    if (el == null) {
      return
    }
    selectElementText(el)
    document.execCommand("copy")
    removeSelection()
    this.props.sendToast("Shopping list copied to clipboard!")
  }

  render() {
    if (isFailure(this.props.items)) {
      return <p>error fetching shoppinglist</p>
    }
    const loadingClass =
      isLoading(this.props.items) || isRefetching(this.props.items)
        ? "has-text-grey-light"
        : ""

    const items = isSuccessOrRefetching(this.props.items)
      ? Object.entries(this.props.items.data)
      : []

    const groups = Object.entries(groupBy(items, (x) => x[1]?.category))

    return (
      <div className={`box p-rel min-height-75px mb-0 p-3 ${loadingClass}`}>
        <Button
          onClick={this.handleSelectList}
          size="small"
          className="r-3 p-abs"
        >
          Copy
        </Button>
        <section ref={this.shoppingList}>
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
        </section>
      </div>
    )
  }
}

interface IShoppingListProps {
  readonly fetchData: (
    teamID: number | "personal",
    startDay: Date,
    endDay: Date,
  ) => void
  readonly teamID: number | "personal"
  readonly startDay: Date
  readonly endDay: Date
  readonly shoppinglist: WebData<IGetShoppingListResponse>
  readonly setStartDay: (date: Date) => void
  readonly setEndDay: (date: Date) => void
  readonly reportBadMerge: () => void
  readonly sendToast: (message: string) => void
}

export const enum Selecting {
  End,
  Start,
  None,
}

function ShoppingList({
  fetchData,
  teamID,
  startDay,
  endDay,
  setStartDay: propsSetStartDay,
  setEndDay: propsSetEndDay,
  shoppinglist,
  sendToast,
  reportBadMerge,
}: IShoppingListProps) {
  const element = useRef<HTMLDivElement>(null)
  const [month, setMonth] = useState(new Date())
  const [selecting, setSelecting] = useState(Selecting.None)

  useEffect(() => {
    if (selecting === Selecting.None) {
      // TODO: refetch data on calendar count for scheduled recipes changes
      fetchData(teamID, startDay, endDay)
    }
  }, [fetchData, teamID, startDay, endDay, selecting])

  const closeInputs = () => {
    setSelecting(Selecting.None)
  }

  const setStartDay = (date: Date) => {
    if (!isValid(date)) {
      return
    }
    propsSetStartDay(date)
    if (isAfter(date, endDay)) {
      propsSetEndDay(date)
    }
    setSelecting(Selecting.End)
  }

  const setEndDay = (date: Date) => {
    if (!isValid(date)) {
      return
    }
    propsSetEndDay(date)
    if (isBefore(date, startDay)) {
      propsSetStartDay(date)
    }
    setSelecting(Selecting.None)
  }

  const handleGeneralClick = (e: MouseEvent) => {
    const el = element.current
    /* eslint-disable-next-line @typescript-eslint/consistent-type-assertions */
    if (el && e.target && !el.contains(e.target as Node)) {
      // outside click
      closeInputs()
    }
  }

  const handleStartPickerClick = () => {
    setSelecting(Selecting.Start)
  }
  const handleEndPickerClick = () => {
    setSelecting(Selecting.End)
  }

  const incrMonth = () => {
    setMonth((m) => addMonths(m, 1))
  }
  const decrMonth = () => {
    setMonth((m) => subMonths(m, 1))
  }

  return (
    <div className="d-grid grid-gap-2">
      <div className="p-rel" ref={element}>
        <div className="d-flex align-items-center no-print">
          <GlobalEvent mouseDown={handleGeneralClick} />
          <DateInput
            onFocus={handleStartPickerClick}
            isFocused={selecting === Selecting.Start}
            placeholder="from"
            value={formatMonth(startDay)}
          />
          <h2 className="fs-4 ml-2 mr-2">{" → "}</h2>
          <DateInput
            onFocus={handleEndPickerClick}
            isFocused={selecting === Selecting.End}
            placeholder="to"
            value={formatMonth(endDay)}
          />
        </div>
        <DateRangePicker
          onClose={closeInputs}
          month={month}
          startDay={startDay}
          endDay={endDay}
          selecting={selecting}
          setStartDay={setStartDay}
          setEndDay={setEndDay}
          nextMonth={incrMonth}
          prevMonth={decrMonth}
        />
      </div>

      <div>
        <ShoppingListList items={shoppinglist} sendToast={sendToast} />
        <div className="d-flex justify-content-end no-print">
          <a onClick={reportBadMerge} className="text-muted italic text-small">
            report bad merge
          </a>
        </div>
      </div>
    </div>
  )
}

function mapStateToProps(state: IState) {
  return {
    startDay: state.shoppinglist.startDay,
    endDay: state.shoppinglist.endDay,
    shoppinglist: state.shoppinglist.shoppinglist,
  }
}

const mapDispatchToProps = (dispatch: Dispatch) => ({
  fetchData: fetchingShoppingListAsync(dispatch),
  setStartDay: (date: Date) => dispatch(setSelectingStart(date)),
  setEndDay: (date: Date) => dispatch(setSelectingEnd(date)),
  reportBadMerge: reportBadMergeAsync(dispatch),
  sendToast: (message: string) => {
    showNotificationWithTimeoutAsync(dispatch)({ message, level: "info" })
  },
})

export default connect(mapStateToProps, mapDispatchToProps)(ShoppingList)
