import { useQueryClient } from "@tanstack/react-query"
import React from "react"
import { useHistory } from "react-router-dom"

import { Select } from "@/components/Forms"
import { BetterLabel } from "@/components/Label"
import { pathSchedule } from "@/paths"
import { useTeamList } from "@/queries/teamList"
import { useTeamId } from "@/useTeamId"

export function ChangeTeam() {
  const queryClient = useQueryClient()
  const history = useHistory()
  const value = useTeamId()

  const onChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const teamID = parseInt(e.target.value, 10)
    // TODO: instead of navigating to the schedule page we should update the
    // path param of the current route if there is a teamID in it.
    // Maybe we can get rid of the teamID from the URL entirely?
    const url = pathSchedule({ teamId: teamID.toString() })
    // navTo is async so we can't count on the URL to have changed by the time we refetch the data
    history.push(url)
    // TODO: we should abstract this -- it's hacky
    void queryClient.invalidateQueries({
      queryKey: [teamID],
    })
    void queryClient.invalidateQueries({
      queryKey: ["user-detail"],
    })
  }
  const teams = useTeamList()
  return (
    <div className="flex flex-col gap-1">
      <BetterLabel>Team</BetterLabel>
      <Select onChange={onChange} value={value} disabled={teams.isPending}>
        {teams.isSuccess
          ? teams.data.map((t) => (
              <option key={t.id} value={t.id}>
                {t.name} (current)
              </option>
            ))
          : null}
      </Select>
    </div>
  )
}
