import React from "react"
import Dropdown from "./Dropdown"
import { Link } from "react-router-dom"
import { ButtonPrimary } from "./Buttons"

import { connect } from "react-redux"

import {
  fetchInvites,
  acceptingInvite,
  decliningInvite,
  Dispatch
} from "../store/actions"

import { teamURL } from "../urls"
import { IInvite } from "../store/reducers/invites";
import { RootState } from "../store/store";

interface IInvitesProps {
  readonly loading: boolean
  readonly invites: IInvite[]
  readonly accept: (id: IInvite['id']) => void
  readonly decline: (id: IInvite['id']) => void
}

const Invites = ({
  loading,
  invites,
  decline,
  accept,
}: IInvitesProps) => {
  if (loading) {
    return <p className="text-muted fs-3 align-self-center">Loading...</p>
  }

  if (invites.length === 0) {
    return (
      <p className="text-muted fs-3 align-self-center">No new notifications.</p>
    )
  }

  return (
    <div>
      {invites.map(({ id, active, team, creator, status, accepting, declining }) => {
        const TeamName = () =>
          active ? (
            <Link to={teamURL(team.id, team.name)}>{team.name}</Link>
          ) : (
            <b>{team.name}</b>
          )

        const InviteButtons = () => {
          if (status === "declined") {
            return <p className="text-muted">declined</p>
          }

          if (status === "accepted") {
            return <p className="text-muted">accepted</p>
          }

          return (
            <div className="d-flex justify-space-between align-items-center">
              <a onClick={() => decline(id)} className="text-muted">
                Decline
              </a>
              <ButtonPrimary
                loading={declining || accepting}
                onClick={() => accept(id)}
                className="is-small">
                Accept
              </ButtonPrimary>
            </div>
          )
        }

        return (
          <div key={id} className="mb-2">
            <p className="mb-1 text-left break-word">
              Invited to <TeamName /> by <b>{creator.email}</b>
            </p>
            <InviteButtons />
          </div>
        )
      })}
    </div>
  )
}

const mapStateToProps = (state: RootState) => {
  return {
    loading: state.invites.loading,
    invites: Object.values(
      (state.invites as {[key: string]: IInvite })
      ).filter(x => x != null && !!x.id)
  }
}

const mapDispatchToProps = (dispatch: Dispatch) => ({
  fetchData: () => dispatch(fetchInvites()),
  accept: (id: IInvite['id']) => dispatch(acceptingInvite(id)),
  decline: (id: IInvite['id']) => dispatch(decliningInvite(id))
})

interface INotificationsDropdownProps {
  readonly fetchData: () => void
  readonly loading: boolean
  readonly invites: IInvite[]
  readonly accept: (id: IInvite['id']) => void
  readonly decline: (id: IInvite['id']) => void

}

class NotificationsDropdown extends React.Component<INotificationsDropdownProps> {
  componentWillMount() {
    this.props.fetchData()
  }

  render() {
    return (
      <Dropdown name="Notifications" relative={false}>
        <Invites
          invites={this.props.invites}
          loading={this.props.loading}
          accept={this.props.accept}
          decline={this.props.decline}
        />
      </Dropdown>
    )
  }
}

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(NotificationsDropdown)
