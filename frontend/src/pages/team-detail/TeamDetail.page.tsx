import { AxiosError } from "axios"
import React, { useState } from "react"
import { RouteComponentProps } from "react-router"
import { Link } from "react-router-dom"

import { assertNever } from "@/assert"
import { Avatar } from "@/components/Avatar"
import { Button } from "@/components/Buttons"
import { Select, TextInput } from "@/components/Forms"
import { Helmet } from "@/components/Helmet"
import { Label } from "@/components/Label"
import { Loader } from "@/components/Loader"
import { NavPage } from "@/components/Page"
import { Tab, Tabs } from "@/components/Tabs"
import { formatHumanDateTime } from "@/date"
import {
  Cell,
  Column,
  Row,
  Table,
  TableBody,
  TableHeader,
} from "@/pages/team-list/Table"
import { pathProfileById } from "@/paths"
import { useTeamDelete } from "@/queries/teamDelete"
import { IMember, useTeam } from "@/queries/teamFetch"
import { useTeamMemberDelete } from "@/queries/teamMemberDelete"
import { useTeamMembersList } from "@/queries/teamMembersList"
import { useTeamMemberUpdate } from "@/queries/teamMemberUpdate"
import { useTeamUpdate } from "@/queries/teamUpdate"
import { inviteURL, teamSettingsURL, teamURL } from "@/urls"
import { useUserId } from "@/useUserId"

function Members({
  teamID,
  loading,
  members,
}: {
  teamID: number
  members: IMember[]
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
        <h1 className="text-center text-2xl font-bold text-[var(--color-text-muted)]">
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
    <Table label="invites">
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
                        <Button
                          variant="danger"
                          size="small"
                          onClick={() => {
                            if (
                              confirm(`Remove member: ${member.user.name}?`)
                            ) {
                              deleteTeamMember.mutate({
                                teamId: teamID,
                                memberId: member.id,
                              })
                            }
                          }}
                          loading={deleteTeamMember.isPending}
                        >
                          {member.user.id === userId ? "leave" : "remove"}
                        </Button>
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
                              teamId: teamID,
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

const TeamMembers = ({
  id,
  name,
  members,
  loading,
}: {
  id: number
  name: string
  members: IMember[]
  loading: boolean
}) => (
  <div className="flex flex-col gap-2">
    <div className="flex items-center justify-between">
      <h2 className="text-2xl">Members</h2>
      <Button variant="primary" to={inviteURL(id, name)}>
        Invite
      </Button>
    </div>
    <Members teamID={id} loading={loading} members={members} />
  </div>
)

function TeamSettings({ id, name: initialName }: { id: number; name: string }) {
  const [name, setName] = useState(initialName)

  const teamUpdate = useTeamUpdate()
  const teamDelete = useTeamDelete()

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    teamUpdate.mutate({ teamId: id, payload: { name } })
  }

  const deleteTeam = () => {
    if (confirm(`Are you sure you want to delete this team "${name}"?`)) {
      teamDelete.mutate({ teamId: id })
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-2">
      <Label>Team Name</Label>
      <TextInput
        disabled={false}
        onChange={(e) => {
          setName(e.target.value)
        }}
        placeholder="The Grand Budapest Staff"
        value={name}
        name="name"
      />
      <div className="flex items-center justify-between">
        <Button
          variant="danger"
          onClick={() => {
            deleteTeam()
          }}
          loading={teamDelete.isPending}
        >
          Delete Team
        </Button>
        <Button variant="primary" type="submit" loading={teamUpdate.isPending}>
          Save Changes
        </Button>
      </div>
    </form>
  )
}

const is404 = (err: unknown) =>
  // eslint-disable-next-line @typescript-eslint/consistent-type-assertions
  (err as AxiosError | undefined)?.response?.status === 404

export function TeamDetailPage(props: RouteComponentProps<{ teamId: string }>) {
  const id = parseInt(props.match.params.teamId, 10)
  const teamInfo = useTeam({ teamId: id })
  const teamMembers = useTeamMembersList({ teamId: id })
  if (is404(teamInfo.error)) {
    return <div>team not found</div>
  }

  if (teamInfo.isError) {
    return <div>error fetching team</div>
  }

  if (teamInfo.isPending) {
    return <div>loading team...</div>
  }

  const isSettings = props.match.url.endsWith("settings")

  return (
    <NavPage>
      <div className="mx-auto max-w-[800px]">
        <Helmet title="Team" />
        <div>
          <h1 className="p-3 text-center text-4xl font-medium">
            {teamInfo.data.name}
          </h1>
        </div>
        <Tabs>
          <Tab isActive={!isSettings}>
            <Link to={teamURL(id, teamInfo.data.name)}>Team</Link>
          </Tab>
          <Tab isActive={isSettings}>
            <Link to={teamSettingsURL(id, teamInfo.data.name)}>Settings</Link>
          </Tab>
        </Tabs>
        {isSettings ? (
          <TeamSettings id={id} name={teamInfo.data.name} />
        ) : (
          <TeamMembers
            id={id}
            name={teamInfo.data.name}
            loading={teamMembers.isPending}
            members={teamMembers.data ?? []}
          />
        )}
      </div>
    </NavPage>
  )
}
