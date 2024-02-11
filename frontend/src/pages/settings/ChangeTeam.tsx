import { useQueryClient } from "@tanstack/react-query"
import React from "react"
import { DialogTrigger } from "react-aria-components"

import { Button } from "@/components/Buttons"
import { BetterLabel } from "@/components/Label"
import { Modal } from "@/components/Modal"
import { Select } from "@/components/Select"
import { useScheduledRecipeSettingsFetch } from "@/queries/scheduledRecipeSettingsFetch"
import { useScheduledRecipeSettingsRegenerateLink } from "@/queries/scheduledRecipeSettingsRegenerateLink"
import { useScheduledRecipeSettingsUpdate } from "@/queries/scheduledRecipeSettingsUpdate"
import { useTeamList } from "@/queries/teamList"
import { useUserUpdate } from "@/queries/userUpdate"
import { useTeamId } from "@/useTeamId"

function CalendarIcon({ size }: { size: number }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      stroke-width="2"
      stroke-linecap="round"
      stroke-linejoin="round"
    >
      <path d="M8 2v4" />
      <path d="M16 2v4" />
      <path d="M21 13V6a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h8" />
      <path d="M3 10h18" />
      <path d="M16 19h6" />
      <path d="M19 16v6" />
    </svg>
  )
}

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
            // TODO: we might want to do something a little fancier, like display a modal
            // and ask people which calendar they want to use, celtics offers outlook,
            // google, and apple
            //
            // Outlook:
            // https://outlook.office.com/calendar/addfromweb?url=webcal://cdn.celtics.com/schedule/ics/2023_celtics_full.ics&name=Boston%20Celtics%202023-24%20Schedule
            //
            // Google:
            // https://calendar.google.com/calendar/u/0/r?cid=webcal://cdn.celtics.com/schedule/ics/2023_celtics_full.ics
            //
            // Apple
            // webcal://cdn.celtics.com/schedule/ics/2023_celtics_full.ics
            <>
              <div className="flex w-full flex-col items-center justify-between gap-2">
                <a
                  href={settings.data.calendarLink}
                  className="flex w-full items-center justify-center gap-2 rounded-md border border-solid border-[--color-border] bg-[--color-background-card] px-3 py-1 font-medium"
                >
                  <CalendarIcon size={18} />
                  <span>Add to Calendar</span>
                </a>
                <div className="flex w-full gap-2">
                  <DialogTrigger>
                    <Button size="small" className="w-full">
                      Reset
                    </Button>
                    <Modal title="Reset Calendar Link">
                      {({ close }) => (
                        <div className="flex flex-col gap-2">
                          <div>
                            Are you sure you want to reset the calendar link?
                          </div>
                          <div className="flex gap-2">
                            <Button onClick={close}>Cancel</Button>
                            <Button
                              variant="danger"
                              loading={regenLink.isPending}
                              onClick={() => {
                                regenLink.mutate(undefined, {
                                  onSuccess: () => {
                                    close()
                                  },
                                })
                              }}
                            >
                              {!regenLink.isPending ? "Reset" : "Reseting..."}
                            </Button>
                          </div>
                        </div>
                      )}
                    </Modal>
                  </DialogTrigger>
                  <Button
                    size="small"
                    className="w-full"
                    onClick={() => {
                      scheduleSettingsUpdate.mutate({
                        update: { syncEnabled: false },
                      })
                    }}
                  >
                    Disable Sync
                  </Button>
                </div>
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
