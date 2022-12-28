import { Link } from "react-router-dom"

import { IInvite, ITeam } from "@/api"
import { Button } from "@/components/Buttons"
import { Loader } from "@/components/Loader"
import { useInviteAccept } from "@/queries/inviteAccept"
import { useInviteDecline } from "@/queries/inviteDecline"
import { useInviteList } from "@/queries/inviteList"
import { teamURL } from "@/urls"

function InviteButtons({ invite }: { invite: IInvite }) {
  const acceptInvite = useInviteAccept()
  const declineInvite = useInviteDecline()

  if (invite.status === "declined") {
    return <p className="text-muted">declined</p>
  }

  if (invite.status === "accepted") {
    return <p className="text-muted">accepted</p>
  }

  return (
    <div className="d-flex justify-space-between align-items-center">
      <Button
        loading={declineInvite.isLoading}
        onClick={() => {
          declineInvite.mutate({ inviteId: invite.id })
        }}
        variant="danger"
        size="small"
      >
        Decline
      </Button>
      <Button
        variant="primary"
        loading={acceptInvite.isLoading}
        onClick={() => {
          acceptInvite.mutate({ inviteId: invite.id })
        }}
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
  const invites = useInviteList()
  if (invites.isLoading) {
    return <Loader />
  }

  if (invites.isError) {
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
            <InviteButtons invite={invite} />
          </div>
        )
      })}
    </div>
  )
}
