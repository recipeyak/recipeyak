import React from "react"
import { connect } from "react-redux"

import { roles } from "./TeamInvite"

import { ButtonPrimary } from "./Buttons"

import { creatingTeam, Dispatch } from "../store/actions"
import { IMember } from "../store/reducers/teams"
import { RootState } from "../store/store"

const mapStateToProps = (state: RootState) => ({
  loading: state.teams.creating
})

const mapDispatchToProps = (dispatch: Dispatch) => ({
  createTeam: (name: string, emails: string[], level: IMember["level"]) =>
    dispatch(creatingTeam(name, emails, level))
})

interface ITeamCreateProps {
  readonly loading: boolean
  readonly createTeam: (
    name: string,
    emails: string[],
    level: IMember["level"]
  ) => void
}
interface ITeamCreateState {
  readonly level: IMember["level"]
  readonly emails: string
  readonly name: string
}

class TeamCreate extends React.Component<ITeamCreateProps, ITeamCreateState> {
  state: ITeamCreateState = {
    level: "contributor",
    emails: "",
    name: ""
  }

  handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) =>
    this.setState(({
      [e.target.name]: e.target.value
    } as unknown) as ITeamCreateState)

  handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const emails = this.state.emails.split(",").filter(x => x !== "")
    const { name, level } = this.state
    try {
      await this.props.createTeam(name, emails, level)
    } catch (e) {} // tslint:disable-line:no-empty
  }

  render() {
    return (
      <div>
        <h1 className="fs-9">Create Team</h1>
        <form action="" onSubmit={this.handleSubmit}>
          <label className="d-flex align-center mb-3">
            Name
            <input
              value={this.state.name}
              onChange={this.handleInputChange}
              className="my-input ml-2"
              type="text"
              placeholder="A Great Team Name"
              name="name"
            />
          </label>

          <div style={{ display: this.state.name === "" ? "none" : undefined }}>
            <h2 className="fs-6">Invite Team Members</h2>

            <input
              type="text"
              className="my-input mb-4"
              value={this.state.emails}
              name="emails"
              onChange={this.handleInputChange}
              placeholder="emails seperated by commas • j@example.com,hey@example.com"
            />
            {roles.map(({ name, value, description }, id) => (
              <label key={id} className="d-flex align-items-center pb-4">
                <input
                  type="radio"
                  className="mr-2"
                  name="level"
                  checked={this.state.level === value}
                  value={value}
                  onChange={this.handleInputChange}
                />
                <div>
                  <h4 className="fs-4 fw-500">{name}</h4>
                  <p className="text-muted">{description}</p>
                </div>
              </label>
            ))}
            <p className="mb-2">
              <b>Note:</b> Users without an account will be sent an email asking
              to create one.
            </p>
          </div>

          <ButtonPrimary
            type="submit"
            loading={this.props.loading}
            className="justify-self-left">
            Create Team
          </ButtonPrimary>
        </form>
      </div>
    )
  }
}

const ConnectedTeamCreate = connect(
  mapStateToProps,
  mapDispatchToProps
)(TeamCreate)

export default ConnectedTeamCreate
