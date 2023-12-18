import { AxiosError } from "axios"
import React, { useState } from "react"
import { RouteComponentProps } from "react-router"
import { Link } from "react-router-dom"

import { Button } from "@/components/Buttons"
import { TextInput } from "@/components/Forms"
import { Helmet } from "@/components/Helmet"
import { Label } from "@/components/Label"
import { Loader } from "@/components/Loader"
import { NavPage } from "@/components/Page"
import { Tab, Tabs } from "@/components/Tabs"
import MemberRow from "@/pages/team-detail/MemberRow"
import { useTeamDelete } from "@/queries/teamDelete"
import { IMember, ITeam, useTeam } from "@/queries/teamFetch"
import { useTeamMembersList } from "@/queries/teamMembersList"
import { useTeamUpdate } from "@/queries/teamUpdate"
import { inviteURL, teamSettingsURL, teamURL } from "@/urls"
import { useUserId } from "@/useUserId"

interface IMembersProps {
  readonly teamID: ITeam["id"]
  readonly members: IMember[]
  readonly loading: boolean
}

function Members({ teamID, loading, members }: IMembersProps) {
  const userId = useUserId()
  if (loading) {
    return <Loader />
  }
  if (members.length > 0) {
    const isTeamAdmin = members.some(
      (x) => x.level === "admin" && x.user.id === userId,
    )
    return (
      <div className="block w-full overflow-x-auto">
        <table className="border-separate border-spacing-y-4">
          <tbody>
            {members.map((x) => (
              <MemberRow
                key={x.id}
                teamID={teamID}
                userID={x.user.id}
                isTeamAdmin={isTeamAdmin}
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
      <h1 className="text-center text-2xl font-bold text-[var(--color-text-muted)]">
        No Team Members
      </h1>
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
    <section className="flex items-center justify-between">
      <h2 className="text-2xl">Members</h2>
      <Button variant="primary" to={inviteURL(id, name)}>
        Invite
      </Button>
    </section>
    <Members teamID={id} loading={loading} members={members} />
  </>
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

interface ITeamNameProps {
  readonly name: string
}
const TeamName = ({ name }: ITeamNameProps) => {
  return (
    <div>
      <h1 className="p-3 text-center text-4xl font-medium">{name}</h1>
    </div>
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
        <TeamName name={teamInfo.data.name} />
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
