import { NavLink } from "react-router-dom"

import { Button } from "@/components/Buttons"
import { Loader } from "@/components/Loader"
import { NavPage } from "@/components/Page"
import { Invites } from "@/pages/team-list/Invites"
import { pathTeamCreate } from "@/paths"
import { useTeamList } from "@/queries/teamList"
import { teamURL } from "@/urls"

function TeamsList() {
  const teams = useTeamList()
  if (teams.isPending) {
    return <Loader />
  }

  if (teams.isError) {
    return <p>failure loading</p>
  }

  if (teams.data.length === 0) {
    return (
      <p className="self-center text-sm text-[var(--color-text-muted)]">
        No teams.
      </p>
    )
  }

  return (
    <div className="text-left">
      {teams.data.map(({ id, name }, index) => (
        <p key={id}>
          <NavLink
            data-testid={`team-${index}`}
            to={teamURL(id, name)}
            activeClassName="font-medium"
          >
            {name}
          </NavLink>
        </p>
      ))}
    </div>
  )
}

export function TeamListPage() {
  return (
    <NavPage>
      <div style={{ maxWidth: 800 }} className="mx-auto max-w-[800px]">
        <section className="flex items-center justify-between">
          <h2 className="text-2xl">Teams</h2>
          <Button to={pathTeamCreate({})}>Create a Team</Button>
        </section>

        <TeamsList />

        <div>
          <h2 className="text-2xl">Invites</h2>
          <Invites />
        </div>
      </div>
    </NavPage>
  )
}
