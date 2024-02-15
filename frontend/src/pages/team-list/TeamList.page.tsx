import { Button } from "@/components/Buttons"
import { NavPage } from "@/components/Page"
import { Invites } from "@/pages/team-list/Invites"
import { TeamsList } from "@/pages/team-list/Teams"
import { pathTeamCreate } from "@/paths"

export function TeamListPage() {
  return (
    <NavPage title="Teams">
      <div className="mx-auto flex max-w-[800px] flex-col gap-4">
        <div className="flex flex-col gap-2">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl">Teams</h2>
            <Button to={pathTeamCreate({})}>Create a Team</Button>
          </div>

          <TeamsList />
        </div>

        <div className="flex flex-col gap-2">
          <h2 className="text-2xl">Invites</h2>
          <Invites />
        </div>
      </div>
    </NavPage>
  )
}
