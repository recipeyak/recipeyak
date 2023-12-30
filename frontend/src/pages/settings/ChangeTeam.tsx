import { useQueryClient } from "@tanstack/react-query"
import React from "react"

import { Select } from "@/components/Forms"
import { BetterLabel } from "@/components/Label"
import { useTeamList } from "@/queries/teamList"
import { useUserUpdate } from "@/queries/userUpdate"
import { useTeamId } from "@/useTeamId"

export function ChangeTeam() {
  const queryClient = useQueryClient()
  const currentTeamId = useTeamId()
  const updateUser = useUserUpdate()

  const onChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const teamId = parseInt(e.target.value, 10)
    updateUser.mutate(
      { schedule_team: teamId },
      {
        onSuccess: () => {
          // TODO: we should abstract this -- it's hacky
          void queryClient.invalidateQueries({
            queryKey: [teamId],
          })
          void queryClient.invalidateQueries({
            queryKey: ["user-detail"],
          })
        },
      },
    )
  }
  const teams = useTeamList()
  return (
    <div className="flex flex-col gap-1">
      <BetterLabel>Team</BetterLabel>
      <Select
        onChange={onChange}
        value={currentTeamId}
        disabled={teams.isPending}
      >
        {teams.isSuccess
          ? teams.data.map((t) => (
              <option key={t.id} value={t.id}>
                {t.name}
              </option>
            ))
          : null}
      </Select>
    </div>
  )
}
