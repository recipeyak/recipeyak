import React from "react";
import { Link } from "react-router-dom";

import NavLink from "../containers/NavLink";
import Logo from "./Logo";
import Dropdown from "./Dropdown";
import NotificationsDropdown from "./NotificationsDropdown";
import UserDropdown from "./UserDropdown";

import { teamURL } from "../urls";

const Teams = ({ teams, loading }) => {
  if (loading) {
    return <p>Loading...</p>;
  }

  if (teams.length === 0) {
    return <p className="text-muted fs-3 align-self-center">No teams.</p>;
  }

  return (
    <div className="text-left">
      {teams.map(({ id, name }) => (
        <p key={id}>
          <NavLink to={teamURL(id, name)} activeClassName="fw-500">
            {name}
          </NavLink>
        </p>
      ))}
    </div>
  );
};

class Navbar extends React.Component {
  static defaultProps = {
    teams: [],
    scheduleURL: ""
  };

  componentWillMount() {
    this.props.fetchData();
  }

  render() {
    const {
      avatarURL,
      loggedIn = true,
      logout,
      email,
      loggingOut,
      className = "",
      toggleDarkMode,
      darkMode,
      scheduleURL
    } = this.props;

    const buttons = loggedIn ? (
      <div className="d-flex align-center p-relative justify-content-center flex-wrap">
        <NavLink
          to="/recipes/add"
          activeClassName="active"
          className="better-nav-item"
        >
          Add
        </NavLink>

        <NotificationsDropdown />

        <Dropdown name="Teams" relative={false}>
          <Teams loading={this.props.loadingTeams} teams={this.props.teams} />
          <Link to="/t/create" className="mt-1 ">
            Create a Team
          </Link>
        </Dropdown>

        <NavLink
          to="/recipes"
          activeClassName="active"
          className="better-nav-item"
        >
          Browse
        </NavLink>
        <NavLink
          to={scheduleURL}
          activeClassName="active"
          className="better-nav-item"
        >
          Schedule
        </NavLink>

        <UserDropdown
          avatarURL={avatarURL}
          email={email}
          toggleDarkMode={toggleDarkMode}
          darkMode={darkMode}
          logout={logout}
          loggingOut={loggingOut}
        />
      </div>
    ) : (
      <div className="d-flex hide-sm">
        <NavLink to="/login" className="better-nav-item">
          Login
        </NavLink>
        <NavLink to="/signup" className="better-nav-item">
          Signup
        </NavLink>
      </div>
    );

    return (
      <nav className={`nav flex-wrap ${className}`}>
        <Link
          to="/"
          className="better-nav-item pl-0 pr-0 fs-2rem fw-normal font-family-title"
        >
          <Logo width="45px" />
          <span>Recipe Yak</span>
        </Link>
        {buttons}
      </nav>
    );
  }
}

export default Navbar;
