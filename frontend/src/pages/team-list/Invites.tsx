import { Link } from "react-router-dom"

import { Button } from "@/components/Buttons"
import { Loader } from "@/components/Loader"
import { useInviteAccept } from "@/queries/inviteAccept"
import { useInviteDecline } from "@/queries/inviteDecline"
import { IInvite, useInviteList } from "@/queries/inviteList"
import { ITeam } from "@/queries/teamFetch"
import { teamURL } from "@/urls"

function InviteButtons({ invite }: { invite: IInvite }) {
  const acceptInvite = useInviteAccept()
  const declineInvite = useInviteDecline()

  if (invite.status === "declined") {
    return <p className="text-[var(--color-text-muted)]">declined</p>
  }

  if (invite.status === "accepted") {
    return <p className="text-[var(--color-text-muted)]">accepted</p>
  }

  return (
    <div className="flex items-center justify-between">
      <Button
        loading={declineInvite.isPending}
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
        loading={acceptInvite.isPending}
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
  if (invites.isPending) {
    return <Loader />
  }

  if (invites.isError) {
    return <p>failure loading</p>
  }

  if (invites.data.length === 0) {
    return (
      <p className="self-center text-sm text-[var(--color-text-muted)]">
        No new notifications.
      </p>
    )
  }

  return (
    <div data-testid="invites-list">
      {invites.data.map((invite) => {
        return (
          <div key={invite.id} className="mb-2">
            <p className="mb-1 text-left [word-break:break-word]">
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
