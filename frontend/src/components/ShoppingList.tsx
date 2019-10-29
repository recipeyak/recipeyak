import React, { useState, useEffect, useRef } from "react"

import { connect } from "react-redux"

import format from "date-fns/format"
import addMonths from "date-fns/addMonths"
import subMonths from "date-fns/subMonths"
import isBefore from "date-fns/isBefore"
import isAfter from "date-fns/isAfter"
import isValid from "date-fns/isValid"

import {
  reportBadMergeAsync,
  showNotificationWithTimeoutAsync,
  Dispatch,
  fetchingShoppingListAsync
} from "@/store/thunks"

import { ingredientByNameAlphabetical } from "@/sorters"

import DateRangePicker from "@/components/DateRangePicker/DateRangePicker"
import { IState } from "@/store/store"
import {
  IShoppingListItem,
  setSelectingStart,
  setSelectingEnd
} from "@/store/reducers/shoppinglist"
import GlobalEvent from "@/components/GlobalEvent"
import { Button } from "@/components/Buttons"
import { DateInput } from "@/components/Forms"
import {
  WebData,
  isFailure,
  isLoading,
  isSuccessOrRefetching,
  isRefetching
} from "@/webdata"
import { classNames } from "@/classnames"

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
  readonly item: IShoppingListItem
  readonly isFirst: boolean
}

function ShoppingListItem({ item, isFirst }: IShoppingListItemProps) {
  // padding serves to prevent the button from appearing in front of text
  // we also use <section>s instead of <p>s to avoid extra new lines in Chrome
  const cls = classNames("text-small", { "mr-15": isFirst })
  return (
    <section className={cls} key={item.unit + item.name}>
      {item.unit} {item.name}
    </section>
  )
}

function mapStateToProps(state: IState) {
  return {
    startDay: state.shoppinglist.startDay,
    endDay: state.shoppinglist.endDay,
    shoppinglist: state.shoppinglist.shoppinglist
  }
}

const mapDispatchToProps = (dispatch: Dispatch) => ({
  fetchData: fetchingShoppingListAsync(dispatch),
  setStartDay: (date: Date) => dispatch(setSelectingStart(date)),
  setEndDay: (date: Date) => dispatch(setSelectingEnd(date)),
  reportBadMerge: reportBadMergeAsync(dispatch),
  sendToast: (message: string) =>
    showNotificationWithTimeoutAsync(dispatch)({ message, level: "info" })
})

interface IShoppingListContainerProps {
  readonly items: WebData<IShoppingListItem[]>
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
      ? this.props.items.data
      : []

    return (
      <div className={`box p-rel min-height-75px mb-0 p-3 ${loadingClass}`}>
        <Button
          onClick={this.handleSelectList}
          size="small"
          className="r-3 p-abs">
          Copy
        </Button>
        <section ref={this.shoppingList}>
          {/* TOOD(sbdchd): sort on backend instead */}
          {items.sort(ingredientByNameAlphabetical).map((x, i) => (
            <ShoppingListItem item={x} isFirst={i === 0} />
          ))}
        </section>
      </div>
    )
  }
}

interface IShoppingListProps {
  readonly fetchData: (teamID: TeamID, startDay: Date, endDay: Date) => void
  readonly teamID: TeamID
  readonly startDay: Date
  readonly endDay: Date
  readonly shoppinglist: WebData<IShoppingListItem[]>
  readonly setStartDay: (date: Date) => void
  readonly setEndDay: (date: Date) => void
  readonly reportBadMerge: () => void
  readonly sendToast: (message: string) => void
}

export const enum Selecting {
  End,
  Start,
  None
}

function ShoppingList({
  fetchData,
  teamID,
  startDay,
  endDay,
  ...props
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

  const closeInputs = () => setSelecting(Selecting.None)

  const setStartDay = (date: Date) => {
    if (!isValid(date)) {
      return
    }
    props.setStartDay(date)
    if (isAfter(date, endDay)) {
      props.setEndDay(date)
    }
    setSelecting(Selecting.End)
  }

  const setEndDay = (date: Date) => {
    if (!isValid(date)) {
      return
    }
    props.setEndDay(date)
    if (isBefore(date, startDay)) {
      props.setStartDay(date)
    }
    setSelecting(Selecting.None)
  }

  const handleGeneralClick = (e: MouseEvent) => {
    const el = element.current
    if (el && e.target && !el.contains(e.target as Node)) {
      // outside click
      closeInputs()
    }
  }

  const handleStartPickerClick = () => setSelecting(Selecting.Start)
  const handleEndPickerClick = () => setSelecting(Selecting.End)

  const incrMonth = () => setMonth(m => addMonths(m, 1))
  const decrMonth = () => setMonth(m => subMonths(m, 1))

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
        <ShoppingListList
          items={props.shoppinglist}
          sendToast={props.sendToast}
        />
        <div className="d-flex justify-content-end no-print">
          <a
            onClick={props.reportBadMerge}
            className="text-muted italic text-small">
            report bad merge
          </a>
        </div>
      </div>
    </div>
  )
}

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(ShoppingList)
