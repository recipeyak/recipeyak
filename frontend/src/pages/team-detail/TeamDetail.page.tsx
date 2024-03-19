import { AxiosError } from "axios"
import React, { useState } from "react"
import { DialogTrigger } from "react-aria-components"
import { RouteComponentProps } from "react-router"
import { Link } from "react-router-dom"

import { Button } from "@/components/Buttons"
import { Helmet } from "@/components/Helmet"
import { Label } from "@/components/Label"
import { Modal } from "@/components/Modal"
import { NavPage } from "@/components/Page"
import { Tab, Tabs } from "@/components/Tabs"
import { TextInput } from "@/components/TextInput"
import { Members } from "@/pages/team-detail/Members"
import { useTeamDelete } from "@/queries/useTeamDelete"
import { useTeam } from "@/queries/useTeamFetch"
import { useTeamUpdate } from "@/queries/useTeamUpdate"
import { teamSettingsURL, teamURL } from "@/urls"

function TeamSettings({ id, name: initialName }: { id: number; name: string }) {
  const [name, setName] = useState(initialName)

  const teamUpdate = useTeamUpdate()
  const teamDelete = useTeamDelete()

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    teamUpdate.mutate({ teamId: id, payload: { name } })
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
        <DialogTrigger>
          <Button variant="danger">Delete Team</Button>
          <Modal title="Delete Team">
            <div className="flex flex-col gap-2">
              <div>Are you sure you want to delete this team "{name}"?</div>
              <div className="flex gap-2">
                <Button>Cancel</Button>
                <Button
                  variant="danger"
                  loading={teamDelete.isPending}
                  onClick={() => {
                    teamDelete.mutate({
                      teamId: id,
                    })
                  }}
                >
                  {!teamDelete.isPending ? "Delete Team" : "Deleting Team..."}
                </Button>
              </div>
            </div>
          </Modal>
        </DialogTrigger>
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
    return (
      <NavPage title="Team">
        <div className="text-center">team not found</div>
      </NavPage>
    )
  }

  if (teamInfo.isError) {
    return (
      <NavPage title="Team">
        <div className="text-center">error fetching team</div>
      </NavPage>
    )
  }

  if (teamInfo.isPending) {
    return (
      <NavPage title="Team">
        <div className="text-center">loading team...</div>
      </NavPage>
    )
  }

  const isSettings = props.match.url.endsWith("settings")

  return (
    <NavPage title="Team">
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
