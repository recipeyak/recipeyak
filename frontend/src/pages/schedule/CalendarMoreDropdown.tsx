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
      <div className="font-medium">iCalendar Feed</div>
      <div>Sync this RecipeYak schedule with your personal calendar.</div>
      {settings.data.syncEnabled ? (
        <>
          <div className="mt-1 flex items-center justify-between">
            <TextInput
              value={settings.data.calendarLink}
              readOnly
              onClick={selectTarget}
              className="min-width-0 mr-3 grow"
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
        className="mx-auto block underline shadow-none "
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
