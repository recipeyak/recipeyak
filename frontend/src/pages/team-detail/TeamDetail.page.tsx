import { AxiosError } from "axios"
import React, { useState } from "react"
import { RouteComponentProps } from "react-router"
import { Link } from "react-router-dom"

import { IMember, ITeam } from "@/api"
import { Button } from "@/components/Buttons"
import { TextInput } from "@/components/Forms"
import { Helmet } from "@/components/Helmet"
import { Loader } from "@/components/Loader"
import { Tab, Tabs } from "@/components/Tabs"
import { useUserId } from "@/hooks"
import MemberRow from "@/pages/team-detail/MemberRow"
import { useTeamDelete } from "@/queries/teamDelete"
import { useTeam } from "@/queries/teamFetch"
import { useTeamMembersList } from "@/queries/teamMembersList"
import { useTeamUpdate } from "@/queries/teamUpdate"
import { inviteURL, teamSettingsURL, teamURL } from "@/urls"

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
      <div className="table-responsive">
        <table className="table-spacing">
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
    <form onSubmit={handleSubmit}>
      <div className="field">
        <label className="label">Team Name</label>
        <TextInput
          disabled={false}
          onChange={(e) => {
            setName(e.target.value)
          }}
          placeholder="The Grand Budapest Staff"
          value={name}
          name="name"
        />
      </div>
      <div className="d-flex justify-space-between align-items-center">
        <Button
          variant="danger"
          onClick={() => {
            deleteTeam()
          }}
          loading={teamDelete.isLoading}
        >
          Delete Team
        </Button>
        <Button variant="primary" type="submit" loading={teamUpdate.isLoading}>
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
      <h1 className="fs-9 text-center fw-500 p-3">{name}</h1>
    </div>
  )
}

const is404 = (err: unknown) =>
  // eslint-disable-next-line @typescript-eslint/consistent-type-assertions
  (err as AxiosError | undefined)?.response?.status === 404

function Team(props: RouteComponentProps<{ id: string }>) {
  const id = parseInt(props.match.params.id, 10)
  const teamInfo = useTeam({ teamId: id })
  const teamMembers = useTeamMembersList({ teamId: id })
  if (is404(teamInfo.error)) {
    return <div>team not found</div>
  }

  if (teamInfo.isError) {
    return <div>error fetching team</div>
  }

  if (teamInfo.isLoading) {
    return <div>loading team...</div>
  }

  const isSettings = props.match.url.endsWith("settings")

  return (
    <div style={{ maxWidth: 800, marginLeft: "auto", marginRight: "auto" }}>
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
          loading={teamMembers.isLoading}
          members={teamMembers.data ?? []}
        />
      )}
    </div>
  )
}

export default Team
