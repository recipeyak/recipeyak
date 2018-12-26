import React from "react"

import { connect } from "react-redux"
import { Link } from "react-router-dom"
import { ButtonLink, ButtonSecondary, ButtonPrimary } from "./Buttons"

import {
  fetchTeams,
  moveRecipeTo,
  copyRecipeTo,
  showNotificationWithTimeout,
  Dispatch,
  INotificationWithTimeout
} from "store/actions"
import { RootState } from "store/store"
import { IRecipe } from "store/reducers/recipes"
import { ITeamsState } from "store/reducers/teams"
import { IUserState } from "store/reducers/user"
import { AxiosError } from "axios"
import { teamURL } from "urls"

const mapStateToProps = (state: RootState) => ({
  teams: state.teams,
  userId: state.user.id
})

const mapDispatchToProps = (dispatch: Dispatch) => ({
  fetchData: fetchTeams(dispatch),
  showNotificationWithTimeout: showNotificationWithTimeout(dispatch),
  moveRecipeTo: moveRecipeTo(dispatch),
  copyRecipeTo: copyRecipeTo(dispatch)
})

interface IOwnerProps {
  readonly fetchData: () => void
  readonly copyRecipeTo: (
    recipeId: IRecipe["id"],
    id: IRecipe["owner"]["id"],
    type: IRecipe["owner"]["type"]
  ) => Promise<void>
  readonly moveRecipeTo: (
    recipeId: IRecipe["id"],
    id: IRecipe["owner"]["id"],
    type: IRecipe["owner"]["type"]
  ) => Promise<void>
  readonly showNotificationWithTimeout: (
    props: INotificationWithTimeout
  ) => void
  readonly recipeId: IRecipe["id"]
  readonly id: IRecipe["owner"]["id"]
  readonly name: string
  readonly teams: ITeamsState
  readonly userId: IUserState["id"]
}

interface IOwnerState {
  readonly show: boolean
  readonly values: string[]
}

// TODO: Create a generalized component with the click event listeners
// we seems to use this functionality a lot
class Owner extends React.Component<IOwnerProps, IOwnerState> {
  state: IOwnerState = {
    show: false,
    values: []
  }

  dropdown = React.createRef<HTMLSpanElement>()

  componentWillMount() {
    document.addEventListener("click", this.handleGeneralClick)
    this.props.fetchData()
  }

  componentWillUnmount() {
    document.removeEventListener("click", this.handleGeneralClick)
  }

  handleGeneralClick = (e: MouseEvent) => {
    const el = this.dropdown.current
    if (el == null) {
      return
    }

    const target = e.target
    if (target == null) {
      return
    }

    const clickedDropdown = el.contains(target as HTMLElement)

    if (clickedDropdown) {
      return
    }
    // clear values when closing dropdown
    this.setState({ show: false, values: [] })
  }

  handleChange = (ev: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedOptions = [...ev.target.selectedOptions].map(opt => opt.value)
    this.setState({ values: selectedOptions })
  }

  toggle = () => {
    this.setState(prev => {
      if (prev.show) {
        // clear values when closing dropdown
        return { ...prev, show: !prev.show, values: [] }
      }
      return { ...prev, show: !prev.show }
    })
  }

  copy() {
    const [id, type] = this.state.values[0].split("-")
    if (id == null || type == null) {
      throw new TypeError("need id/type to move to")
    }
    if (type !== "team" && type !== "user") {
      throw new TypeError("type can only either be a team or a user")
    }
    this.props
      .copyRecipeTo(this.props.recipeId, parseInt(id, 10), type)
      .then(() => this.setState({ show: false, values: [] }))
      .catch((err: AxiosError) => {
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
    if (type !== "team" && type !== "user") {
      throw new TypeError("type can only either be a team or a user")
    }

    this.props
      .moveRecipeTo(this.props.recipeId, parseInt(id, 10), type)
      .then(() => this.setState({ show: false, values: [] }))
      .catch((err: AxiosError) => {
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
    const { name, teams, userId } = this.props
    const { moving, copying } = teams
    const teamUserKeys = [
      ...teams.allIds.map(id => ({ id: id + "-team", name: teams[id].name })),
      { id: userId + "-user", name: "personal" }
    ]

    const url = teamURL(this.props.id, this.props.name)

    return (
      <span className="fw-500 p-rel" ref={this.dropdown}>
        <b className="cursor-pointer" onClick={this.toggle}>
          via
        </b>{" "}
        <Link to={url}>{name}</Link>
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
                  {teamUserKeys.map(opt => (
                    <option className="fs-3 fw-500" key={opt.id} value={opt.id}>
                      {opt.name}
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

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(Owner)
