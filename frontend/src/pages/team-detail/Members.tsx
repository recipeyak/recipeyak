import { DialogTrigger } from "react-aria-components"
import { Link } from "react-router-dom"

import { assertNever } from "@/assert"
import { Avatar } from "@/components/Avatar"
import { Button } from "@/components/Buttons"
import { Loader } from "@/components/Loader"
import { Modal } from "@/components/Modal"
import { Select } from "@/components/Select"
import {
  Cell,
  Column,
  Row,
  Table,
  TableBody,
  TableHeader,
} from "@/components/Table"
import { formatHumanDateTime } from "@/date"
import { pathProfileById, pathTeamInvite } from "@/paths"
import { useTeamMemberDelete } from "@/queries/useTeamMemberDelete"
import { useTeamMembersList } from "@/queries/useTeamMembersList"
import { useTeamMemberUpdate } from "@/queries/useTeamMemberUpdate"
import { useUserId } from "@/useUserId"

function MembersList({
  teamId,
  loading,
  members,
}: {
  teamId: number
  members: {
    id: number
    created: string
    level: "admin" | "contributor" | "read"
    user: { id: number; name: string | null; avatar_url: string; email: string }
  }[]
  loading: boolean
}) {
  const userId = useUserId()
  const deleteTeamMember = useTeamMemberDelete()
  const updateTeamMember = useTeamMemberUpdate()
  if (loading) {
    return <Loader />
  }

  if (members.length === 0) {
    return (
      <div>
        <h1 className="text-center text-2xl font-bold text-[--color-text-muted]">
          No Team Members
        </h1>
        <div className="text-center">Add one via the Invite button</div>
      </div>
    )
  }

  const columns = [
    {
      id: "user" as const,
      name: "Member",
    },
    {
      id: "level" as const,
      name: "Level",
    },
    {
      id: "joinedAt" as const,
      name: "Joined",
    },
    {
      id: "action" as const,
      name: "Action",
    },
  ]

  const isTeamAdmin = members.some(
    (x) => x.level === "admin" && x.user.id === userId,
  )

  return (
    <Table label="members">
      <TableHeader columns={columns}>
        {(column) => {
          return <Column isRowHeader>{column.name}</Column>
        }}
      </TableHeader>
      <TableBody items={members}>
        {(member) => {
          return (
            <Row columns={columns}>
              {(column) => {
                if (column.id === "user") {
                  return (
                    <Cell>
                      <Link
                        className="flex items-center gap-2"
                        to={pathProfileById({
                          userId: member.user.id.toString(),
                        })}
                      >
                        <Avatar avatarURL={member.user.avatar_url} />
                        <span>{member.user.email}</span>
                      </Link>
                    </Cell>
                  )
                } else if (column.id === "joinedAt") {
                  return (
                    <Cell>{formatHumanDateTime(new Date(member.created))}</Cell>
                  )
                } else if (column.id === "action") {
                  return (
                    <Cell>
                      {member.user.id === userId || isTeamAdmin ? (
                        <DialogTrigger>
                          <Button variant="danger" size="small">
                            {member.user.id === userId ? "Leave" : "Remove"}
                          </Button>
                          <Modal title="Delete Note">
                            <div className="flex flex-col gap-2">
                              <div>
                                Are you sure you want to remove this member:{" "}
                                {member.user.name}?
                              </div>
                              <div className="flex gap-2">
                                <Button>Cancel</Button>
                                <Button
                                  variant="danger"
                                  loading={deleteTeamMember.isPending}
                                  onClick={() => {
                                    deleteTeamMember.mutate({
                                      teamId,
                                      memberId: member.id,
                                    })
                                  }}
                                >
                                  {!deleteTeamMember.isPending
                                    ? "Remove"
                                    : "Removing..."}
                                </Button>
                              </div>
                            </div>
                          </Modal>
                        </DialogTrigger>
                      ) : (
                        <div>–</div>
                      )}
                    </Cell>
                  )
                } else if (column.id === "level") {
                  return (
                    <Cell>
                      {isTeamAdmin ? (
                        <Select
                          value={member.level}
                          onChange={(e) => {
                            updateTeamMember.mutate({
                              teamId,
                              memberId: member.id,
                              // eslint-disable-next-line @typescript-eslint/consistent-type-assertions
                              level: e.target.value as
                                | "admin"
                                | "contributor"
                                | "read",
                            })
                          }}
                        >
                          <option value="admin">Admin</option>
                          <option value="contributor">Contributor</option>
                          <option value="read">Read</option>
                        </Select>
                      ) : (
                        <div className="font-medium">{member.level}</div>
                      )}
                    </Cell>
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

export function Members({ teamId }: { teamId: number }) {
  const teamMembers = useTeamMembersList({ teamId })
  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl">Members</h2>
        <Button
          variant="primary"
          to={pathTeamInvite({ teamId: teamId.toString() })}
        >
          Invite
        </Button>
      </div>
      <MembersList
        teamId={teamId}
        loading={teamMembers.isPending}
        members={teamMembers.data ?? []}
      />
    </div>
  )
}
