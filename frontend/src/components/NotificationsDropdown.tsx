import React from "react"
import { Link } from "react-router-dom"
import { ButtonPrimary } from "@/components/Buttons"

import {
  acceptingInviteAsync,
  fetchingInvitesAsync,
  decliningInviteAsync,
} from "@/store/thunks"

import { teamURL } from "@/urls"
import { getInvites, IInvite } from "@/store/reducers/invites"
import {
  DropdownContainer,
  useDropdown,
  DropdownMenu,
} from "@/components/Dropdown"
import { Chevron } from "@/components/icons"
import { useDispatch, useSelector } from "@/hooks"
import { isLoading, isFailure, isInitial } from "@/webdata"
import { ITeam } from "@/store/reducers/teams"

function useNotifications() {
  const dispatch = useDispatch()
  React.useEffect(() => {
    fetchingInvitesAsync(dispatch)()
  }, [dispatch])
  const invites = useSelector(getInvites)
  return { invites }
}

function useInviteUpdate(inviteId: IInvite["id"]) {
  const dispatch = useDispatch()
  const decline = React.useCallback(() => {
    decliningInviteAsync(dispatch)(inviteId)
  }, [dispatch, inviteId])
  const accept = React.useCallback(() => {
    acceptingInviteAsync(dispatch)(inviteId)
  }, [dispatch, inviteId])
  const accepting = useSelector(s => !!s.invites.byId[inviteId]?.accepting)
  const status = useSelector(s => s.invites.byId[inviteId]?.status)
  return { decline, accept, accepting, status }
}

interface IInviteButtonsProps {
  readonly inviteId: IInvite["id"]
}

function InviteButtons({ inviteId }: IInviteButtonsProps) {
  const { status, decline, accept, accepting } = useInviteUpdate(inviteId)

  if (status === "declined") {
    return <p className="text-muted">declined</p>
  }

  if (status === "accepted") {
    return <p className="text-muted">accepted</p>
  }

  return (
    <div className="d-flex justify-space-between align-items-center">
      <a onClick={decline} className="text-muted">
        Decline
      </a>
      <ButtonPrimary loading={accepting} onClick={accept} size="small">
        Accept
      </ButtonPrimary>
    </div>
  )
}

interface ITeamNameProps {
  readonly teamId: ITeam["id"]
  readonly name: ITeam["name"]
  readonly active: IInvite["active"]
}
function TeamName({ teamId, name, active }: ITeamNameProps) {
  if (active) {
    return <Link to={teamURL(teamId, name)}>{name}</Link>
  }
  return <b>{name}</b>
}
function Invites() {
  const { invites } = useNotifications()
  if (isLoading(invites) || isInitial(invites)) {
    return <p className="text-muted text-small align-self-center">Loading...</p>
  }

  if (isFailure(invites)) {
    return <p>failure loading</p>
  }

  if (invites.data.length === 0) {
    return (
      <p className="text-muted text-small align-self-center">
        No new notifications.
      </p>
    )
  }

  return (
    <div>
      {invites.data.map(invite => {
        return (
          <div key={invite.id} className="mb-2">
            <p className="mb-1 text-left break-word">
              Invited to{" "}
              <TeamName
                teamId={invite.team.id}
                name={invite.team.name}
                active={invite.active}
              />{" "}
              by <b>{invite.creator.email}</b>
            </p>
            <InviteButtons inviteId={invite.id} />
          </div>
        )
      })}
    </div>
  )
}

export function NotificationsDropdown() {
  const { ref, toggle, isOpen } = useDropdown()
  return (
    <DropdownContainer ref={ref}>
      <a onClick={toggle} tabIndex={0} className="better-nav-item">
        <span>Notifications</span>
        <Chevron />
      </a>

      <DropdownMenu isOpen={isOpen}>
        <Invites />
      </DropdownMenu>
    </DropdownContainer>
  )
}
