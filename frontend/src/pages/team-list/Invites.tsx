import { Link } from "react-router-dom"

import { assertNever } from "@/assert"
import { clx } from "@/classnames"
import { Avatar } from "@/components/Avatar"
import { Button } from "@/components/Buttons"
import { Loader } from "@/components/Loader"
import {
  Cell,
  Column,
  Row,
  Table,
  TableBody,
  TableHeader,
} from "@/components/Table"
import { formatHumanDateTime } from "@/date"
import { pathProfileById, pathTeamDetail } from "@/paths"
import { useInviteAccept } from "@/queries/inviteAccept"
import { useInviteDecline } from "@/queries/inviteDecline"
import { IInvite, useInviteList } from "@/queries/inviteList"

function InviteButtons({ invite }: { invite: IInvite }) {
  const acceptInvite = useInviteAccept()
  const declineInvite = useInviteDecline()

  if (invite.status === "declined" || invite.status === "accepted") {
    return (
      <div
        className={clx(
          "rounded-3xl border border-solid  px-2 py-0 text-center text-sm font-medium",
          invite.status === "declined" && "border-red-600 text-red-500",
          invite.status === "accepted" && "border-green-600 text-green-500",
        )}
      >
        {invite.status === "declined" && "Declined"}
        {invite.status === "accepted" && "Accepted"}
      </div>
    )
  }
  if (invite.status === "open") {
    return (
      <div className="flex items-center justify-between gap-2">
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
  assertNever(invite.status)
}

export function Invites() {
  const invites = useInviteList()
  if (invites.isPending) {
    return <Loader />
  }

  if (invites.isError) {
    return <div>failure loading</div>
  }

  if (invites.data.length === 0) {
    return (
      <div className="self-center text-sm text-[var(--color-text-muted)]">
        No new notifications.
      </div>
    )
  }

  const columns = [
    {
      id: "teamName" as const,
      name: "Team",
    },
    {
      id: "creator" as const,
      name: "Creator",
    },
    {
      id: "createdAt" as const,
      name: "Created",
    },
    {
      id: "status" as const,
      name: "Status",
    },
  ]

  return (
    <Table label="invites">
      <TableHeader columns={columns}>
        {(column) => {
          return <Column isRowHeader>{column.name}</Column>
        }}
      </TableHeader>
      <TableBody items={invites.data}>
        {(invite) => {
          return (
            <Row columns={columns}>
              {(column) => {
                if (column.id === "creator") {
                  return (
                    <Cell>
                      <Link
                        className="flex items-center gap-2"
                        to={pathProfileById({
                          userId: invite.creator.id.toString(),
                        })}
                      >
                        <Avatar avatarURL={invite.creator.avatar_url} />
                        <span>{invite.creator.email}</span>
                      </Link>
                    </Cell>
                  )
                } else if (column.id === "status") {
                  return (
                    <Cell>
                      <InviteButtons invite={invite} />
                    </Cell>
                  )
                } else if (column.id === "teamName") {
                  return (
                    <Cell>
                      <Link
                        to={pathTeamDetail({
                          teamId: invite.team.id.toString(),
                        })}
                      >
                        {invite.team.name}
                      </Link>
                    </Cell>
                  )
                } else if (column.id === "createdAt") {
                  return (
                    <Cell>{formatHumanDateTime(new Date(invite.created))}</Cell>
                  )
                } else {
                  assertNever(column)
                }
              }}
            </Row>
          )
        }}
      </TableBody>
    </Table>
  )
}
