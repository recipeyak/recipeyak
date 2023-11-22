import { UseQueryResult } from "@tanstack/react-query"

import { Button } from "@/components/Buttons"
import { selectTarget, TextInput } from "@/components/Forms"
import { Loader } from "@/components/Loader"
import { useTeamId } from "@/hooks"
import { useScheduledRecipeSettingsRegenerateLink } from "@/queries/scheduledRecipeSettingsRegenerateLink"
import { useScheduledRecipeSettingsUpdate } from "@/queries/scheduledRecipeSettingsUpdate"

export function ICalConfig({
  settings,
}: {
  readonly settings: UseQueryResult<
    {
      readonly syncEnabled: boolean
      readonly calendarLink: string
    },
    unknown
  >
}) {
  const teamID = useTeamId()
  const regenLink = useScheduledRecipeSettingsRegenerateLink()
  const scheduleSettingsUpdate = useScheduledRecipeSettingsUpdate()
  if (!settings.isSuccess) {
    return <Loader />
  }
  return (
    <div>
      <div className="fw-500">iCalendar Feed</div>
      <div>Sync this RecipeYak schedule with your personal calendar.</div>
      {settings.data.syncEnabled ? (
        <>
          <div className="d-flex justify-space-between align-items-center mt-1">
            <TextInput
              value={settings.data.calendarLink}
              readOnly
              onClick={selectTarget}
              className="mr-3 min-width-0 flex-grow-1"
            />
            <Button
              size="small"
              loading={regenLink.isPending}
              onClick={() => {
                regenLink.mutate()
              }}
            >
              Reset
            </Button>
          </div>
        </>
      ) : null}
      <Button
        variant="link"
        className="d-block mx-auto text-underline box-shadow-none "
        size="small"
        onClick={() => {
          const syncEnabled = !settings.data.syncEnabled
          scheduleSettingsUpdate.mutate({
            teamID,
            update: { syncEnabled },
          })
        }}
      >
        {settings.data.syncEnabled ? "Disable Sync" : "Enable Sync"}
      </Button>
    </div>
  )
}
