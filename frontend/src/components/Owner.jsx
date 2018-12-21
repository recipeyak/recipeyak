import React from "react"

import { connect } from "react-redux"
import { Link } from "react-router-dom"
import { ButtonLink, ButtonSecondary, ButtonPrimary } from "./Buttons"

import {
  fetchTeams,
  moveRecipeTo,
  copyRecipeTo,
  showNotificationWithTimeout
} from "../store/actions"

const mapStateToProps = state => ({
  teams: state.teams,
  userId: state.user.id
})

const mapDispatchToProps = dispatch => ({
  fetchData: () => dispatch(fetchTeams()),
  showNotificationWithTimeout: options =>
    dispatch(showNotificationWithTimeout(options)),
  moveRecipeTo: (recipeId, ownerId, type) =>
    dispatch(moveRecipeTo(recipeId, ownerId, type)),
  copyRecipeTo: (recipeId, ownerId, type) =>
    dispatch(copyRecipeTo(recipeId, ownerId, type))
})

// TODO: Create a generalized component with the click event listeners
// we seems to use this functionality a lot

@connect(
  mapStateToProps,
  mapDispatchToProps
)
export default class Owner extends React.Component {
  state = {
    show: false,
    values: []
  }

  componentWillMount() {
    document.addEventListener("click", this.handleGeneralClick)
    this.props.fetchData()
  }

  componentWillUnmount() {
    document.removeEventListener("click", this.handleGeneralClick)
  }

  handleGeneralClick = e => {
    const clickedDropdown = this.dropdown && this.dropdown.contains(e.target)
    if (clickedDropdown) return
    // clear values when closing dropdown
    this.setState({ show: false, values: [] })
  }

  handleChange = e => {
    // convert HTMLCollection to list of option values
    const selectedOptions = [...e.target.selectedOptions].map(e => e.value)
    this.setState({ values: selectedOptions })
  }

  toggle = () => {
    this.setState(prev => {
      if (prev.show) {
        // clear values when closing dropdown
        return { show: !prev.show, values: [] }
      }
      return { show: !prev.show }
    })
  }

  copy() {
    const [id, type] = this.state.values[0].split("-")
    if (id == null || type == null) {
      throw new TypeError("need id/type to move to")
    }
    this.props
      .copyRecipeTo(this.props.recipeId, id, type)
      .then(() => this.setState({ show: false, values: [] }))
      .catch(err => {
        this.props.showNotificationWithTimeout({
          message: `Problem copying recipe: ${err}`,
          level: "danger",
          sticky: true
        })
      })
  }

  move() {
    const [id, type] = this.state.values[0].split("-")
    if (id == null || type == null) {
      throw new TypeError("need id/type to copy to")
    }
    this.props
      .moveRecipeTo(this.props.recipeId, id, type)
      .then(() => this.setState({ show: false, values: [] }))
      .catch(err => {
        this.props.showNotificationWithTimeout({
          message: `Problem moving recipe: ${err}`,
          level: "danger",
          sticky: true
        })
      })
  }

  disableMove() {
    return this.state.values.length !== 1
  }

  disableCopy() {
    return this.state.values.length !== 1
  }

  render() {
    const { type, url, name, teams, userId } = this.props
    const { moving, copying } = teams
    const teamUserKeys = [
      ...teams.allIds.map(id => ({ id: id + "-team", name: teams[id].name })),
      { id: userId + "-user", name: "personal" }
    ]

    return (
      <span
        className="fw-500 p-rel"
        ref={dropdown => {
          this.dropdown = dropdown
        }}>
        <b className="cursor-pointer" onClick={this.toggle}>
          via
        </b>{" "}
        {type === "user" ? "you" : <Link to={url}>{name}</Link>}
        <div className={"" + (this.state.show ? " d-block" : " d-none")}>
          <div className="p-abs">
            <div className="dropdown-content">
              <div className="text-center">Teams</div>
              <hr className="dropdown-divider mt-1 mb-1" />
              <div className="max-height-25vh overflow-y-scroll select is-multiple w-100">
                <select
                  multiple={true}
                  className="my-select"
                  value={this.state.values}
                  onChange={this.handleChange}>
                  {teamUserKeys.map(({ id, name }) => (
                    <option className="fs-3 fw-500" key={id} value={id}>
                      {name}
                    </option>
                  ))}
                </select>
              </div>
              <hr className="dropdown-divider" />
              <div className="d-flex justify-space-between ml-2 mr-2">
                <ButtonLink className="is-small" onClick={this.toggle}>
                  cancel
                </ButtonLink>
                <div className="d-flex justify-space-between">
                  <ButtonSecondary
                    className={"is-small mr-1" + (moving ? " is-loading" : "")}
                    onClick={() => this.move()}
                    disabled={this.disableMove()}>
                    move
                  </ButtonSecondary>
                  <ButtonPrimary
                    className={"is-small" + (copying ? " is-loading" : "")}
                    onClick={() => this.copy()}
                    disabled={this.disableCopy()}>
                    copy
                  </ButtonPrimary>
                </div>
              </div>
            </div>
          </div>
        </div>
      </span>
    )
  }
}
