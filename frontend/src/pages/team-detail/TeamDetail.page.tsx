import { AxiosError } from "axios"
import React, { useState } from "react"
import { RouteComponentProps } from "react-router"
import { Link } from "react-router-dom"

import { Button } from "@/components/Buttons"
import { TextInput } from "@/components/Forms"
import { Helmet } from "@/components/Helmet"
import { Label } from "@/components/Label"
import { NavPage } from "@/components/Page"
import { Tab, Tabs } from "@/components/Tabs"
import { Members } from "@/pages/team-detail/Members"
import { useTeamDelete } from "@/queries/teamDelete"
import { useTeam } from "@/queries/teamFetch"
import { useTeamUpdate } from "@/queries/teamUpdate"
import { teamSettingsURL, teamURL } from "@/urls"

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
          <Members teamId={id} />
        )}
      </div>
    </NavPage>
  )
}
