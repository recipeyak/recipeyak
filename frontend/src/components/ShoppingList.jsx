import React from "react";
import PropTypes from "prop-types";
import { connect } from "react-redux";

import format from "date-fns/format";
import addMonths from "date-fns/add_months";
import subMonths from "date-fns/sub_months";
import isBefore from "date-fns/is_before";
import isAfter from "date-fns/is_after";
import isValid from "date-fns/is_valid";

import { classNames } from "../classnames";

import {
  fetchShoppingList,
  setSelectingStart,
  setSelectingEnd,
  reportBadMerge,
  showNotificationWithTimeout
} from "../store/actions";

import { ingredientByNameAlphabetical } from "../sorters";

import DateRangePicker from "./DateRangePicker/DateRangePicker";

const selectElementText = el => {
  const sel = window.getSelection();
  const range = document.createRange();
  range.selectNodeContents(el);
  sel.removeAllRanges();
  sel.addRange(range);
};

const removeSelection = () => {
  window.getSelection().removeAllRanges();
};

function formatMonth(date) {
  if (date == null) {
    return "";
  }
  return format(date, "YYYY-MM-DD");
}

function mapStateToProps(state) {
  return {
    startDay: state.shoppinglist.startDay,
    endDay: state.shoppinglist.endDay,
    loading: state.shoppinglist.loading,
    error: state.shoppinglist.error,
    shoppinglist: state.shoppinglist.shoppinglist.sort(
      ingredientByNameAlphabetical
    )
  };
}

const mapDispatchToProps = dispatch => ({
  fetchData: (teamID, start, end) =>
    dispatch(fetchShoppingList(teamID, start, end)),
  setStartDay: date => dispatch(setSelectingStart(date)),
  setEndDay: date => dispatch(setSelectingEnd(date)),
  reportBadMerge: () => dispatch(reportBadMerge()),
  sendToast: message =>
    dispatch(showNotificationWithTimeout({ message, level: "info" }))
});

@connect(
  mapStateToProps,
  mapDispatchToProps
)
class ShoppingList extends React.Component {
  static propTypes = {
    refetchData: PropTypes.func.isRequired,
    teamID: PropTypes.oneOfType([PropTypes.string, PropTypes.number])
      .isRequired,
    startDay: PropTypes.object.isRequired,
    endDay: PropTypes.object.isRequired,
    loading: PropTypes.bool.isRequired,
    error: PropTypes.bool.isRequired,
    shoppinglist: PropTypes.array.isRequired,
    setStartDay: PropTypes.func.isRequired,
    setEndDay: PropTypes.func.isRequired,
    reportBadMerge: PropTypes.func.isRequired,
    sendToast: PropTypes.func.isRequired
  };

  state = {
    month: new Date(),

    selectingStart: false,
    selectingEnd: false,

    showDatePicker: false
  };

  componentDidMount() {
    this.refetchData();
  }

  componentWillMount() {
    document.addEventListener("click", this.handleGeneralClick);
  }

  componentWillUnmount() {
    document.removeEventListener("click", this.handleGeneralClick);
  }

  refetchData = () => {
    // TODO: refetch data on calendar count for scheduled recipes changes
    this.props.fetchData(
      this.props.teamID,
      this.props.startDay,
      this.props.endDay
    );
  };

  handleGeneralClick = e => {
    const picker = document.querySelector("#date-range-picker");
    const clickedPicker = picker && picker.contains(e.target);

    const clickedInputs = this.inputs && this.inputs.contains(e.target);
    if (clickedPicker || clickedInputs) return;
    this.setState({
      showDatePicker: false,
      selectingStart: false,
      selectingEnd: false
    });
  };

  setStartDay = date => {
    if (!isValid(date)) return;
    this.props.setStartDay(date);
    if (isAfter(date, this.props.endDay)) {
      this.props.setEndDay(date);
    }
    this.setState(
      {
        selectingStart: false,
        selectingEnd: true
      },
      this.refetchData
    );
  };

  setEndDay = date => {
    if (!isValid(date)) return;
    this.props.setEndDay(date);
    if (isBefore(date, this.props.startDay)) {
      this.props.setStartDay(date);
    }
    this.setState(
      {
        selectingEnd: false,
        showDatePicker: false
      },
      this.refetchData
    );
  };

  render() {
    return (
      <div className="d-grid grid-gap-2">
        <div className="p-rel">
          <div
            ref={i => {
              this.inputs = i;
            }}
            className="d-flex align-items-center no-print"
          >
            <input
              onFocus={() =>
                this.setState({
                  showDatePicker: true,
                  selectingStart: true,
                  selectingEnd: false
                })
              }
              onChange={this.setStartDay}
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
              onChange={this.setEndDay}
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
            }`}
          >
            <button
              onClick={() => {
                selectElementText(document.querySelector("#shoppinglist"));
                document.execCommand("copy");
                removeSelection();
                this.props.sendToast("Shopping list copied to clipboard!");
              }}
              className="my-button is-small r-5 p-abs"
            >
              Copy
            </button>
            {this.props.error ? (
              <p>error fetching shoppinglist</p>
            ) : (
              <section id="shoppinglist" style={{ fontSize: "0.9rem" }}>
                {this.props.shoppinglist.map((x, i) => (
                  // padding serves to prevent the button from appearing in front of text
                  <p className={i === 0 ? "mr-15" : ""} key={x.unit + x.name}>
                    {x.unit} {x.name}
                  </p>
                ))}
              </section>
            )}
          </div>
          <div className="d-flex justify-content-end no-print">
            <a
              onClick={this.props.reportBadMerge}
              className="text-muted italic fs-3"
            >
              report bad merge
            </a>
          </div>
        </div>
      </div>
    );
  }
}
export default ShoppingList;
