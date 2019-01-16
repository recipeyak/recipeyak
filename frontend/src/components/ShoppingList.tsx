import React from "react"

import { connect } from "react-redux"

import format from "date-fns/format"
import addMonths from "date-fns/add_months"
import subMonths from "date-fns/sub_months"
import isBefore from "date-fns/is_before"
import isAfter from "date-fns/is_after"
import isValid from "date-fns/is_valid"

import {
  reportBadMerge,
  showNotificationWithTimeout,
  Dispatch,
  fetchingShoppingList
} from "@/store/actions"

import { ingredientByNameAlphabetical } from "@/sorters"

import DateRangePicker from "@/components/DateRangePicker/DateRangePicker"
import { RootState } from "@/store/store"
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

const selectElementText = (el: Element) => {
  const sel = window.getSelection()
  const range = document.createRange()
  range.selectNodeContents(el)
  sel.removeAllRanges()
  sel.addRange(range)
}

const removeSelection = () => {
  window.getSelection().removeAllRanges()
}

function formatMonth(date: Date | null) {
  if (date == null) {
    return ""
  }
  return format(date, "YYYY-MM-DD")
}

function mapStateToProps(state: RootState) {
  return {
    startDay: state.shoppinglist.startDay,
    endDay: state.shoppinglist.endDay,
    shoppinglist: state.shoppinglist.shoppinglist
  }
}

const mapDispatchToProps = (dispatch: Dispatch) => ({
  fetchData: fetchingShoppingList(dispatch),
  setStartDay: (date: Date) => dispatch(setSelectingStart(date)),
  setEndDay: (date: Date) => dispatch(setSelectingEnd(date)),
  reportBadMerge: reportBadMerge(dispatch),
  sendToast: (message: string) =>
    showNotificationWithTimeout(dispatch)({ message, level: "info" })
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
      <div className={`box p-rel min-height-75px mb-0 ${loadingClass}`}>
        <Button
          onClick={this.handleSelectList}
          size="small"
          className="r-5 p-abs">
          Copy
        </Button>
        <section ref={this.shoppingList} style={{ fontSize: "0.9rem" }}>
          {/* TOOD(sbdchd): sort on backend instead */}
          {items.sort(ingredientByNameAlphabetical).map((x, i) => (
            // padding serves to prevent the button from appearing in front of text
            // we also use <section>s instead of <p>s to avoid extra new lines in Chrome
            <section className={i === 0 ? "mr-15" : ""} key={x.unit + x.name}>
              {x.unit} {x.name}
            </section>
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

interface IShoppingListState {
  readonly month: Date
  readonly selectingStart: boolean
  readonly selectingEnd: boolean
  readonly showDatePicker: boolean
}

class ShoppingList extends React.Component<
  IShoppingListProps,
  IShoppingListState
> {
  element = React.createRef<HTMLDivElement>()

  state: IShoppingListState = {
    month: new Date(),

    selectingStart: false,
    selectingEnd: false,

    showDatePicker: false
  }

  componentDidMount() {
    this.refetchData()
  }

  refetchData = () => {
    // TODO: refetch data on calendar count for scheduled recipes changes
    this.props.fetchData(
      this.props.teamID,
      this.props.startDay,
      this.props.endDay
    )
  }

  closeInputs = () => {
    this.setState({
      showDatePicker: false,
      selectingStart: false,
      selectingEnd: false
    })
  }

  setStartDay = (date: Date) => {
    if (!isValid(date)) {
      return
    }
    this.props.setStartDay(date)
    if (isAfter(date, this.props.endDay)) {
      this.props.setEndDay(date)
    }
    this.setState(
      {
        selectingStart: false,
        selectingEnd: true
      },
      this.refetchData
    )
  }

  setEndDay = (date: Date) => {
    if (!isValid(date)) {
      return
    }
    this.props.setEndDay(date)
    if (isBefore(date, this.props.startDay)) {
      this.props.setStartDay(date)
    }
    this.setState(
      {
        selectingEnd: false,
        showDatePicker: false
      },
      this.refetchData
    )
  }

  handleGeneralClick = (e: MouseEvent) => {
    const el = this.element.current
    if (el && e.target && !el.contains(e.target as Node)) {
      // outside click
      this.closeInputs()
    }
  }

  render() {
    return (
      <div className="d-grid grid-gap-2">
        <div className="p-rel" ref={this.element}>
          <div className="d-flex align-items-center no-print">
            <GlobalEvent mouseDown={this.handleGeneralClick} />
            <DateInput
              onFocus={() =>
                this.setState({
                  showDatePicker: true,
                  selectingStart: true,
                  selectingEnd: false
                })
              }
              isFocused={this.state.selectingStart}
              placeholder="from"
              value={formatMonth(this.props.startDay)}
            />
            <h2 className="fs-4 ml-2 mr-2">{" → "}</h2>
            <DateInput
              onFocus={() =>
                this.setState({
                  showDatePicker: true,
                  selectingEnd: true,
                  selectingStart: false
                })
              }
              isFocused={this.state.selectingEnd}
              placeholder="to"
              value={formatMonth(this.props.endDay)}
            />
          </div>
          <DateRangePicker
            visible={this.state.showDatePicker}
            onClose={this.closeInputs}
            month={this.state.month}
            startDay={this.props.startDay}
            endDay={this.props.endDay}
            selectingStart={this.state.selectingStart}
            selectingEnd={this.state.selectingEnd}
            setStartDay={this.setStartDay}
            setEndDay={this.setEndDay}
            nextMonth={() =>
              this.setState(({ month }) => ({ month: addMonths(month, 1) }))
            }
            prevMonth={() =>
              this.setState(({ month }) => ({ month: subMonths(month, 1) }))
            }
          />
        </div>

        <div>
          <ShoppingListList
            items={this.props.shoppinglist}
            sendToast={this.props.sendToast}
          />
          <div className="d-flex justify-content-end no-print">
            <a
              onClick={this.props.reportBadMerge}
              className="text-muted italic fs-3">
              report bad merge
            </a>
          </div>
        </div>
      </div>
    )
  }
}
export default connect(
  mapStateToProps,
  mapDispatchToProps
)(ShoppingList)
