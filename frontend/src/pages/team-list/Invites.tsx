import React from "react"
import { Link } from "react-router-dom"

import { Button } from "@/components/Buttons"
import { Loader } from "@/components/Loader"
import { useDispatch, useSelector } from "@/hooks"
import { getInvites, IInvite } from "@/store/reducers/invites"
import { ITeam } from "@/store/reducers/teams"
import {
  acceptingInviteAsync,
  decliningInviteAsync,
  fetchingInvitesAsync,
} from "@/store/thunks"
import { teamURL } from "@/urls"
import { isFailure, isInitial, isLoading } from "@/webdata"

function useNotifications() {
  const dispatch = useDispatch()
  React.useEffect(() => {
    void fetchingInvitesAsync(dispatch)()
  }, [dispatch])
  const invites = useSelector(getInvites)
  return { invites }
}

function useInviteUpdate(inviteId: IInvite["id"]) {
  const dispatch = useDispatch()
  const decline = React.useCallback(() => {
    void decliningInviteAsync(dispatch)(inviteId)
  }, [dispatch, inviteId])
  const accept = React.useCallback(() => {
    void acceptingInviteAsync(dispatch)(inviteId)
  }, [dispatch, inviteId])
  const accepting = useSelector((s) => !!s.invites.byId[inviteId]?.accepting)
  const status = useSelector((s) => s.invites.byId[inviteId]?.status)
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
      <Button
        variant="primary"
        loading={accepting}
        onClick={accept}
        size="small"
      >
        Accept
      </Button>
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
export function Invites() {
  const { invites } = useNotifications()
  if (isLoading(invites) || isInitial(invites)) {
    return <Loader />
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
      {invites.data.map((invite) => {
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
