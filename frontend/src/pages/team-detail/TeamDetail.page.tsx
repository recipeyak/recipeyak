import React from "react"
import { connect } from "react-redux"
import { RouteComponentProps } from "react-router"
import { Link } from "react-router-dom"

import { Button, ButtonLink } from "@/components/Buttons"
import { TextInput } from "@/components/Forms"
import { Helmet } from "@/components/Helmet"
import { Loader } from "@/components/Loader"
import { Tab, Tabs } from "@/components/Tabs"
import MemberRow from "@/pages/team-detail/MemberRow"
import { IMember, ITeam } from "@/store/reducers/teams"
import { IState } from "@/store/store"
import {
  deletingTeamAsync,
  Dispatch,
  fetchingTeamAsync,
  fetchingTeamMembersAsync,
  updatingTeamAsync,
} from "@/store/thunks"
import { inviteURL, teamSettingsURL, teamURL } from "@/urls"
import { notUndefined } from "@/utils/general"

interface IMembersProps {
  readonly teamID: ITeam["id"]
  readonly members: IMember[]
  readonly loading: boolean
}

function Members({ teamID, loading, members }: IMembersProps) {
  if (loading) {
    return <Loader />
  }
  if (members.length > 0) {
    return (
      <div className="table-responsive">
        <table className="table-spacing">
          <tbody>
            {members.map((x) => (
              <MemberRow
                key={x.id}
                teamID={teamID}
                userID={x.user.id}
                membershipID={x.id}
                level={x.level}
                avatarURL={x.user.avatar_url}
                email={x.user.email}
                isActive={x.is_active}
              />
            ))}
          </tbody>
        </table>
      </div>
    )
  }

  return (
    <section>
      <h1 className="text-center fs-6 bold text-muted">No Team Members</h1>
      <p className="text-center">Add one via the Invite button</p>
    </section>
  )
}

interface ITeamMembers {
  readonly id: ITeam["id"]
  readonly name: ITeam["name"]
  readonly members: IMember[]
  readonly loading: boolean
}

const TeamMembers = ({ id, name, members, loading }: ITeamMembers) => (
  <>
    <section className="d-flex justify-space-between align-items-center">
      <h2 className="fs-6">Members</h2>
      <Link className="button is-primary" to={inviteURL(id, name)}>
        Invite
      </Link>
    </section>
    <Members teamID={id} loading={loading} members={members} />
  </>
)

interface ITeamSettingsProps {
  readonly id: ITeam["id"]
  readonly name: ITeam["name"]
  readonly updatingTeam: (
    id: ITeam["id"],
    team: { name: string },
  ) => Promise<void>
  readonly deleteTeam: (id: ITeam["id"]) => Promise<void>
  readonly loading: boolean
}

interface ITeamSettingsState {
  readonly name: string
  readonly loadingDeleteTeam: boolean
  readonly loadingSaveChanges: boolean
}

class TeamSettings extends React.Component<
  ITeamSettingsProps,
  ITeamSettingsState
> {
  state: ITeamSettingsState = {
    name: "loading...",
    loadingDeleteTeam: false,
    loadingSaveChanges: false,
  }

  static defaultProps = {
    name: "loading",
    id: 0,
  }

  componentWillMount() {
    this.setState({ name: this.props.name })
  }

  componentWillReceiveProps(nextProps: ITeamSettingsProps) {
    this.setState({ name: nextProps.name })
  }

  handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    this.setState({ name: e.target.value })
  }

  handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    this.setState({ loadingSaveChanges: true })
    void this.props
      .updatingTeam(this.props.id, { name: this.state.name })
      .then(() => {
        this.setState({ loadingSaveChanges: false })
      })
  }

  deleteTeam = () => {
    if (
      confirm(`Are you sure you want to delete this team "${this.props.name}"?`)
    ) {
      this.setState({ loadingDeleteTeam: true })
      void this.props.deleteTeam(this.props.id).then(() => {
        this.setState({ loadingDeleteTeam: false })
      })
    }
  }

  render() {
    return (
      <form onSubmit={this.handleSubmit}>
        <div className="field">
          <label className="label">Team Name</label>
          <TextInput
            disabled={this.props.loading}
            onChange={this.handleInputChange}
            placeholder="The Grand Budapest Staff"
            value={this.state.name}
            name="name"
          />
        </div>
        <div className="d-flex justify-space-between align-items-center">
          <Button
            color="primary"
            type="submit"
            loading={this.state.loadingSaveChanges}
          >
            Save Changes
          </Button>
          <ButtonLink
            onClick={() => {
              this.deleteTeam()
            }}
            loading={this.state.loadingDeleteTeam}
          >
            Delete Team
          </ButtonLink>
        </div>
      </form>
    )
  }
}

interface ITeamNameProps {
  readonly loading: boolean
  readonly name: string
}
const TeamName = ({ loading, name }: ITeamNameProps) => {
  if (loading) {
    return <Loader />
  }
  return (
    <div>
      <h1 className="fs-9 text-center fw-500 p-3">{name}</h1>
    </div>
  )
}

interface ITeamProps {
  readonly id: ITeam["id"]
  readonly fetchData: (id: ITeam["id"]) => void
  readonly deleteTeam: (id: ITeam["id"]) => Promise<void>
  readonly updatingTeam: (
    id: ITeam["id"],
    team: { name: string },
  ) => Promise<void>
  readonly members: IMember[]
  readonly error404: boolean
  readonly loadingTeam: boolean
  readonly name: string
  readonly isSettings: boolean
  readonly loadingMembers: boolean
}

class Team extends React.Component<ITeamProps> {
  componentWillMount() {
    this.props.fetchData(this.props.id)
  }

  componentWillReceiveProps(nextProps: ITeamProps) {
    const newID = nextProps.id !== this.props.id
    if (newID) {
      this.props.fetchData(nextProps.id)
    }
  }

  render() {
    if (this.props.error404) {
      return <p>team not found</p>
    }

    return (
      <div>
        <Helmet title="Team" />
        <TeamName loading={this.props.loadingTeam} name={this.props.name} />
        <Tabs>
          <Tab isActive={!this.props.isSettings}>
            <Link to={teamURL(this.props.id, this.props.name)}>Team</Link>
          </Tab>
          <Tab isActive={this.props.isSettings}>
            <Link to={teamSettingsURL(this.props.id, this.props.name)}>
              Settings
            </Link>
          </Tab>
        </Tabs>
        {this.props.isSettings ? (
          <TeamSettings
            id={this.props.id}
            name={this.props.name}
            updatingTeam={this.props.updatingTeam}
            deleteTeam={this.props.deleteTeam}
            loading={this.props.loadingTeam}
          />
        ) : (
          <TeamMembers
            id={this.props.id}
            name={this.props.name}
            loading={this.props.loadingMembers}
            members={this.props.members}
          />
        )}
      </div>
    )
  }
}

type RouteProps = RouteComponentProps<{ id: string }>

const mapStateToProps = (state: IState, props: RouteProps) => {
  const id = parseInt(props.match.params.id, 10)
  const team = state.teams.byId[id]

  // TODO(sbdchd): clean up this mess

  const isSettings = props.match.url.endsWith("settings")

  const members = team == null || team.members == null ? [] : team.members

  const teamMembers = Object.values(members).filter(notUndefined)

  const loadingTeam = team ? !!team.loadingTeam && !team.name : false
  const loadingMembers = team?.loadingMembers ?? true

  return {
    id,
    members: teamMembers,
    isSettings,
    error404: team ? !!team.error404 : false,
    loadingTeam,
    name: team ? team.name : "",
    loadingMembers,
  }
}
const mapDispatchToProps = (dispatch: Dispatch) => {
  return {
    fetchData: (id: ITeam["id"]) =>
      Promise.all([
        fetchingTeamAsync(dispatch)(id),
        fetchingTeamMembersAsync(dispatch)(id),
      ]),
    deleteTeam: deletingTeamAsync(dispatch),
    updatingTeam: updatingTeamAsync(dispatch),
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(Team)
