import { NavLink } from "react-router-dom"

import { Loader } from "@/components/Loader"
import { Link } from "@/components/Routing"
import { Invites } from "@/pages/team-list/Invites"
import { useTeamList } from "@/queries/teamList"
import { teamURL } from "@/urls"

function TeamsList() {
  const teams = useTeamList()
  if (teams.isLoading) {
    return <Loader />
  }

  if (teams.isError) {
    return <p>failure loading</p>
  }

  if (teams.data.length === 0) {
    return <p className="text-muted text-small align-self-center">No teams.</p>
  }

  return (
    <div className="text-left">
      {teams.data.map(({ id, name }) => (
        <p key={id}>
          <NavLink to={teamURL(id, name)} activeClassName="fw-500">
            {name}
          </NavLink>
        </p>
      ))}
    </div>
  )
}

export default function TeamsPage() {
  return (
    <div style={{ maxWidth: 800 }} className="mx-auto mw-800">
      <section className="d-flex justify-space-between align-items-center">
        <h2 className="fs-6">Teams</h2>
        <Link to="/t/create" className="mt-1 ">
          Create a Team
        </Link>
      </section>

      <TeamsList />

      <div>
        <h2 className="fs-6">Invites</h2>
        <Invites />
      </div>
    </div>
  )
}
