import { ButtonLink, ButtonPlain, ButtonSecondary } from "@/components/Buttons"
import {
  DropdownContainer,
  DropdownMenu,
  useDropdown,
} from "@/components/Dropdown"
import { selectTarget, TextInput } from "@/components/Forms"
import { Loader } from "@/components/Loader"
import { isSuccessLike, WebData } from "@/webdata"

function Hr() {
  return <hr className="my-2" />
}

export function CalendarMoreDropdown({
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
  const { ref, toggle, isOpen } = useDropdown()
  return (
    <DropdownContainer ref={ref}>
      <ButtonPlain
        size="small"
        className="ml-1"
        onClick={toggle}
        disabled={!isSuccessLike(settings)}
      >
        more
      </ButtonPlain>
      <DropdownMenu isOpen={isOpen} className="white-space-initial w-300px">
        {isSuccessLike(settings) ? (
          <>
            <div className="d-flex align-items-center p-relative">
              <p className="fw-bold mx-auto">Calendar Settings</p>
              <button
                className="delete r-0 p-absolute"
                aria-label="close"
                onClick={toggle}
              />
            </div>
            <Hr />
            <p>Sync this RecipeYak schedule with your personal calendar.</p>
            {settings.data.syncEnabled ? (
              <>
                <Hr />
                <p className="fw-bold mb-1">iCalendar Feed</p>
                <div className="d-flex justify-space-between align-items-center">
                  <TextInput
                    value={settings.data.calendarLink}
                    readOnly
                    onClick={selectTarget}
                    className="mr-3 min-width-0"
                  />
                  <ButtonSecondary
                    size="small"
                    onClick={regenerateCalendarLink}
                  >
                    Reset
                  </ButtonSecondary>
                </div>
              </>
            ) : null}
            <ButtonLink
              className="d-block mx-auto text-underline box-shadow-none "
              onClick={() => {
                setSyncEnabled(!settings.data.syncEnabled)
              }}
            >
              {settings.data.syncEnabled ? "Disable Sync" : "Enable Sync"}
            </ButtonLink>
          </>
        ) : (
          <Loader />
        )}
      </DropdownMenu>
    </DropdownContainer>
  )
}
