import React from "react";
import { connect } from "react-redux";
import startOfMonth from "date-fns/start_of_month";
import endOfMonth from "date-fns/end_of_month";
import eachDay from "date-fns/each_day";
import addMonths from "date-fns/add_months";
import subMonths from "date-fns/sub_months";
import subDays from "date-fns/sub_days";
import addDays from "date-fns/add_days";
import format from "date-fns/format";
import PropTypes from "prop-types";

import {
  fetchCalendar,
  fetchTeams,
  fetchShoppingList,
  fetchRecipeList,
  setScheduleURL
} from "../store/actions";

import { pyFormat, daysFromSunday, daysUntilSaturday } from "../date";

import { teamsFrom } from "../store/mapState";

import { push } from "react-router-redux";

import { ButtonPrimary, ButtonPlain } from "./Buttons";
import Loader from "./Loader";
import CalendarDay from "./CalendarDay";

function monthYearFromDate(date) {
  return format(date, "MMM | YYYY");
}

const mapStateToProps = (state, props) => {
  const isTeam = props.match.params.id != null;
  const teamID = isTeam ? parseInt(props.match.params.id, 10) : "personal";

  const days = state.calendar.allIds
    .map(id => state.calendar[id])
    .filter(x => {
      if (!isTeam) {
        // we know that if there is a userID, it will be the current user's
        return x.user != null;
      }
      return x.team === teamID;
    })
    .reduce(
      (a, b) => ({
        ...a,
        [b.on]: {
          ...a[b.on],
          [b.id]: b
        }
      }),
      {}
    );

  return {
    days,
    loading: state.calendar.loading,
    error: state.calendar.error,
    loadingTeams: state.teams.loading,
    teams: teamsFrom(state),
    teamID,
    isTeam,
    start: state.shoppinglist.startDay,
    end: state.shoppinglist.endDay
  };
};

const mapDispatchToProps = dispatch => ({
  fetchData: (month, teamID = "personal") =>
    dispatch(fetchCalendar(teamID, month)),
  fetchTeams: () => dispatch(fetchTeams()),
  navTo: url => {
    dispatch(push(url));
    dispatch(setScheduleURL(url));
  },
  refetchShoppingListAndRecipes: (teamID, start, end) => {
    return Promise.all([
      dispatch(fetchRecipeList(teamID)),
      dispatch(fetchShoppingList(teamID, start, end))
    ]);
  }
});

@connect(
  mapStateToProps,
  mapDispatchToProps
)
export default class Calendar extends React.Component {
  state = {
    month: new Date(),
    initialLoad: false,
    owner: "personal"
  };

  static propTypes = {
    loadingTeams: PropTypes.bool.isRequired,
    loading: PropTypes.bool.isRequired,
    error: PropTypes.bool.isRequired,
    className: PropTypes.string.isRequired,
    fetchData: PropTypes.func.isRequired,
    fetchTeams: PropTypes.func.isRequired,
    navTo: PropTypes.func.isRequired,
    teams: PropTypes.arrayOf(PropTypes.object).isRequired,
    isTeam: PropTypes.bool.isRequired,
    teamID: PropTypes.oneOfType([PropTypes.number, PropTypes.string])
      .isRequired,
    refetchShoppingListAndRecipes: PropTypes.func.isRequired
  };

  static defaultProps = {
    loading: true,
    error: false,
    className: "",
    loadingTeams: true,
    teams: [],
    teamID: "personal"
  };

  componentDidMount() {
    this.props.fetchTeams();
    this.props
      .fetchData(this.state.month, this.props.teamID)
      .then(() => this.setState({ initialLoad: true }));
  }

  refetchData = (teamID = this.props.teamID) => {
    this.props.fetchData(this.state.month, teamID);
    this.props.refetchShoppingListAndRecipes(
      teamID,
      this.props.startDay,
      this.props.endDay
    );
  };

  prevMonth = () => {
    this.setState(({ month }) => ({
      month: subMonths(month, 1)
    }));
    this.props.fetchData(this.state.month, this.props.teamID);
  };

  nextMonth = () => {
    this.setState(({ month }) => ({
      month: addMonths(month, 1)
    }));
    this.props.fetchData(this.state.month, this.props.teamID);
  };

  currentMonth = () => {
    this.setState({ month: new Date() });
  };

  handleOwnerChange = e => {
    const teamID = e.target.value;
    const url = teamID === "personal" ? "/schedule/" : `/t/${teamID}/schedule/`;

    const isRecipes = this.props.match.params["type"] === "recipes";

    const ending = isRecipes ? "recipes" : "shopping";

    const urlWithEnding = url + ending;

    // navTo is async so we can't count on the URL to have changed by the time we refetch the data
    this.props.navTo(urlWithEnding);
    this.refetchData(teamID);
  };

  render() {
    if (this.props.error) {
      return <p>Error fetching data</p>;
    }

    if (this.props.loading && !this.state.initialLoad) {
      return (
        <div
          className={`d-flex w-100 justify-content-center align-items-center ${
            this.props.className
          }`}
        >
          <div>
            <Loader />
          </div>
        </div>
      );
    }

    return (
      <div className={`flex-grow-1 ${this.props.className}`}>
        <div className="d-flex justify-space-between align-items-end">
          <div className="d-flex align-items-center">
            <p title={this.state.month.toString()}>
              {monthYearFromDate(this.state.month)}
            </p>
            <div className="select is-small ml-2">
              <select
                onChange={this.handleOwnerChange}
                value={this.props.teamID}
                disabled={this.props.loadingTeams}
              >
                <option value="personal">Personal</option>
                {this.props.teams.map(t => (
                  <option key={t.id} value={t.id}>
                    {t.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <ButtonPlain className="is-small" onClick={this.prevMonth}>
              {"←"}
            </ButtonPlain>
            <ButtonPrimary
              className="ml-1 mr-1 is-small"
              onClick={this.currentMonth}
            >
              Today
            </ButtonPrimary>
            <ButtonPlain className="is-small" onClick={this.nextMonth}>
              {"→"}
            </ButtonPlain>
          </div>
        </div>
        <div
          className={
            "d-grid grid-gap-1 calendar-grid grid-auto-rows-unset mb-0"
          }
        >
          <b>Su</b>
          <b>Mo</b>
          <b>Tu</b>
          <b>We</b>
          <b>Th</b>
          <b>Fr</b>
          <b>Sa</b>
        </div>
        <div className={"d-grid grid-gap-1 calendar-grid mb-0"}>
          {eachDay(
            subDays(
              startOfMonth(this.state.month),
              daysFromSunday(this.state.month)
            ),
            addDays(
              endOfMonth(this.state.month),
              daysUntilSaturday(endOfMonth(this.state.month))
            )
          ).map(date => (
            <CalendarDay
              item={this.props.days[pyFormat(date)]}
              date={date}
              key={date}
              teamID={this.props.teamID}
            />
          ))}
        </div>
        <p className="mt-1">
          press <kbd>?</kbd> for help
        </p>
      </div>
    );
  }
}
