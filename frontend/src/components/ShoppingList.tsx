import React from "react"

import { connect } from "react-redux"

import format from "date-fns/format"
import addMonths from "date-fns/add_months"
import subMonths from "date-fns/sub_months"
import isBefore from "date-fns/is_before"
import isAfter from "date-fns/is_after"
import isValid from "date-fns/is_valid"

import { classNames } from "@/classnames"

import {
  fetchShoppingList,
  reportBadMerge,
  showNotificationWithTimeout,
  Dispatch
} from "@/store/actions"

import { ingredientByNameAlphabetical } from "@/sorters"

import DateRangePicker from "@/components/DateRangePicker/DateRangePicker"
import { RootState } from "@/store/store"
import { ITeam } from "@/store/reducers/teams"
import {
  IShoppingListItem,
  setSelectingStart,
  setSelectingEnd
} from "@/store/reducers/shoppinglist"
import GlobalEvent from "@/components/GlobalEvent"

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
    loading: state.shoppinglist.loading,
    error: state.shoppinglist.error,
    shoppinglist: state.shoppinglist.shoppinglist.sort(
      ingredientByNameAlphabetical
    )
  }
}

const mapDispatchToProps = (dispatch: Dispatch) => ({
  fetchData: fetchShoppingList(dispatch),
  setStartDay: (date: Date) => dispatch(setSelectingStart(date)),
  setEndDay: (date: Date) => dispatch(setSelectingEnd(date)),
  reportBadMerge: reportBadMerge(dispatch),
  sendToast: (message: string) =>
    showNotificationWithTimeout(dispatch)({ message, level: "info" })
})

interface IShoppingListProps {
  readonly fetchData: (
    teamID: ITeam["id"] | "personal",
    startDay: Date,
    endDay: Date
  ) => void
  readonly teamID: ITeam["id"] | "personal"
  readonly startDay: Date
  readonly endDay: Date
  readonly loading: boolean
  readonly error: boolean
  readonly shoppinglist: IShoppingListItem[]
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
            <input
              onFocus={() =>
                this.setState({
                  showDatePicker: true,
                  selectingStart: true,
                  selectingEnd: false
                })
              }
              type="date"
              className={classNames("my-input", {
                "is-focused": this.state.selectingStart
              })}
              placeholder="from"
              value={formatMonth(this.props.startDay)}
            />
            <h2 className="fs-4 ml-2 mr-2">{" → "}</h2>
            <input
              onFocus={() =>
                this.setState({
                  showDatePicker: true,
                  selectingEnd: true,
                  selectingStart: false
                })
              }
              type="date"
              className={classNames("my-input", {
                "is-focused": this.state.selectingEnd
              })}
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
          <div
            className={`box p-rel min-height-75px mb-0 ${
              this.props.loading ? "has-text-grey-light" : ""
            }`}>
            <button
              onClick={() => {
                const el = document.querySelector("#shoppinglist")
                if (el == null) {
                  return
                }
                selectElementText(el)
                document.execCommand("copy")
                removeSelection()
                this.props.sendToast("Shopping list copied to clipboard!")
              }}
              className="my-button is-small r-5 p-abs">
              Copy
            </button>
            {this.props.error ? (
              <p>error fetching shoppinglist</p>
            ) : (
              <section id="shoppinglist" style={{ fontSize: "0.9rem" }}>
                {this.props.shoppinglist.map((x, i) => (
                  // padding serves to prevent the button from appearing in front of text
                  // we also use <section>s instead of <p>s to avoid extra new lines in Chrome
                  <section
                    className={i === 0 ? "mr-15" : ""}
                    key={x.unit + x.name}>
                    {x.unit} {x.name}
                  </section>
                ))}
              </section>
            )}
          </div>
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
