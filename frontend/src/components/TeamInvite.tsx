import React from "react"
import { Helmet } from "@/components/Helmet"
import { Link, RouteComponentProps } from "react-router-dom"
import { connect } from "react-redux"

import { ButtonPrimary } from "@/components/Buttons"

import NoMatch from "@/components/NoMatch"
import Loader from "@/components/Loader"

import { teamURL } from "@/urls"

import {
  fetchingTeamAsync,
  sendingTeamInvitesAsync,
  Dispatch
} from "@/store/thunks"
import { IState } from "@/store/store"
import { IMember, ITeam } from "@/store/reducers/teams"
import { TextInput, RadioButton } from "@/components/Forms"
import { Result, isErr } from "@/result"

const mapStateToProps = (state: IState, props: ITeamInviteProps) => {
  const id = parseInt(props.match.params.id, 10)
  const team = state.teams.byId[id] ? state.teams.byId[id] : {}

  return {
    ...team,
    id
  }
}

const mapDispatchToProps = (dispatch: Dispatch) => ({
  fetchData: fetchingTeamAsync(dispatch),
  sendInvites: sendingTeamInvitesAsync(dispatch)
})

export const roles = [
  {
    name: "Admin",
    value: "admin",
    description: "Add and remove recipes, members."
  },
  {
    name: "Contributor",
    value: "contributor",
    description: "Add and remove recipes and view all members."
  },
  {
    name: "Viewer",
    value: "viewer",
    description: "View all team recipes and members."
  }
]

interface ITeamInviteProps extends RouteComponentProps<{ id: string }> {
  readonly id: ITeam["id"]
  readonly fetchData: (id: ITeam["id"]) => Promise<void>
  readonly sendInvites: (
    id: ITeam["id"],
    emails: string[],
    level: IMember["level"]
  ) => Promise<Result<void, void>>
  readonly loadingTeam: boolean
  readonly name: string
  readonly error404: boolean
  readonly sendingTeamInvites: boolean
}
interface ITeamInviteState {
  readonly level: IMember["level"]
  readonly emails: string
}

class TeamInvite extends React.Component<ITeamInviteProps, ITeamInviteState> {
  state: ITeamInviteState = {
    level: "contributor",
    emails: ""
  }

  static defaultProps = {
    loadingTeam: true,
    sendingTeamInvites: false
  }

  componentWillMount() {
    this.props.fetchData(this.props.id)
  }

  handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) =>
    /* eslint-disable @typescript-eslint/consistent-type-assertions */
    this.setState(({
      [e.target.name]: e.target.value
    } as unknown) as ITeamInviteState)
  /* eslint-enable @typescript-eslint/consistent-type-assertions */

  render() {
    const { name, id, loadingTeam } = this.props

    if (this.props.error404) {
      return <NoMatch />
    }

    if (loadingTeam) {
      return <Loader />
    }

    return (
      <div>
        <Helmet title="Team Invite" />
        <Link to={teamURL(id, name)}>
          <h1 className="fs-9 text-center fw-500 p-4">{name}</h1>
        </Link>
        <section className="d-flex justify-space-between align-items-center mb-2">
          <h2 className="fs-6">Invite Team Members</h2>
        </section>

        <form
          action=""
          className=""
          onSubmit={async e => {
            e.preventDefault()
            const emails = this.state.emails.split(",").filter(x => x !== "")
            const result = await this.props.sendInvites(
              id,
              emails,
              this.state.level
            )
            if (isErr(result)) {
              // On failure, we should leave our email state unchanged.
              return
            }
            this.setState({ emails: "" })
          }}>
          <TextInput
            className="mb-4"
            value={this.state.emails}
            name="emails"
            onChange={this.handleInputChange}
            placeholder="emails seperated by commas • j@example.com,hey@example.com"
          />
          {roles.map((role, index) => (
            <label key={index} className="d-flex align-items-center pb-4">
              <RadioButton
                className="mr-2"
                name="level"
                checked={this.state.level === role.value}
                value={role.value}
                onChange={this.handleInputChange}
              />
              <div>
                <h4 className="fs-4 fw-500">{role.name}</h4>
                <p className="text-muted">{role.description}</p>
              </div>
            </label>
          ))}
          <p className="mb-2">
            <b>Note:</b> Users without an account will be sent an email asking
            to create one.
          </p>
          <ButtonPrimary
            type="submit"
            loading={this.props.sendingTeamInvites}
            className="justify-self-left">
            Send Invite
          </ButtonPrimary>
        </form>
      </div>
    )
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(TeamInvite)
