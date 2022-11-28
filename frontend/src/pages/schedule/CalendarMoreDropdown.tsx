import { ButtonLink, ButtonSecondary } from "@/components/Buttons"
import { selectTarget, TextInput } from "@/components/Forms"
import { Loader } from "@/components/Loader"
import { isSuccessLike, WebData } from "@/webdata"

export function ICalConfig({
  settings,
  setSyncEnabled,
  regenerateCalendarLink,
}: {
  readonly settings: WebData<{
    readonly syncEnabled: boolean
    readonly calendarLink: string
  }>
  readonly setSyncEnabled: (_: boolean) => void
  readonly regenerateCalendarLink: () => void
}) {
  if (!isSuccessLike(settings)) {
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
            <ButtonSecondary size="small" onClick={regenerateCalendarLink}>
              Reset
            </ButtonSecondary>
          </div>
        </>
      ) : null}
      <ButtonLink
        className="d-block mx-auto text-underline box-shadow-none "
        size="small"
        onClick={() => {
          setSyncEnabled(!settings.data.syncEnabled)
        }}
      >
        {settings.data.syncEnabled ? "Disable Sync" : "Enable Sync"}
      </ButtonLink>
    </div>
  )
}
