import { useQueryClient } from "@tanstack/react-query"
import React from "react"

import { Button } from "@/components/Buttons"
import { Select, TextInput } from "@/components/Forms"
import { BetterLabel } from "@/components/Label"
import { useScheduledRecipeSettingsFetch } from "@/queries/scheduledRecipeSettingsFetch"
import { useScheduledRecipeSettingsRegenerateLink } from "@/queries/scheduledRecipeSettingsRegenerateLink"
import { useScheduledRecipeSettingsUpdate } from "@/queries/scheduledRecipeSettingsUpdate"
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
  const regenLink = useScheduledRecipeSettingsRegenerateLink()
  const scheduleSettingsUpdate = useScheduledRecipeSettingsUpdate()
  const settings = useScheduledRecipeSettingsFetch()
  return (
    <div className="flex flex-col items-start gap-1">
      <BetterLabel>Team</BetterLabel>
      <div className="flex flex-col items-start gap-2">
        <div>
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

        <div className="flex flex-col items-start gap-1">
          <div>
            <div className="font-medium">iCalendar Feed</div>
            <div className="text-sm">
              Sync the team's schedule with your calendar.
            </div>
          </div>
          {settings?.data?.syncEnabled ? (
            <>
              <div className="flex items-center justify-between gap-2">
                <TextInput
                  value={settings.data.calendarLink}
                  readOnly
                  onClick={(e: {
                    target: EventTarget | { select: () => void }
                  }) => {
                    // hack to get around typescript not knowing about the select property
                    if ("select" in e.target) {
                      e.target.select()
                    }
                  }}
                  className="min-w-0 grow"
                />
                <Button
                  size="small"
                  loading={regenLink.isPending}
                  onClick={() => {
                    if (
                      confirm(
                        "Are you sure you want to reset the calendar link?",
                      )
                    ) {
                      regenLink.mutate()
                    }
                  }}
                >
                  Reset
                </Button>
                <Button
                  size="small"
                  onClick={() => {
                    scheduleSettingsUpdate.mutate({
                      update: { syncEnabled: false },
                    })
                  }}
                >
                  Disable
                </Button>
              </div>
            </>
          ) : (
            <Button
              size="small"
              onClick={() => {
                scheduleSettingsUpdate.mutate({
                  update: { syncEnabled: true },
                })
              }}
            >
              Enable sync
            </Button>
          )}
        </div>
      </div>
    </div>
  )
}
