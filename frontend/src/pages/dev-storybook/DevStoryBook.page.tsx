import { clx } from "@/classnames"
import { Button } from "@/components/Buttons"
import { THEME_META } from "@/themeConstants"

function ButtonSection({
  theme,
  themeName,
}: {
  theme: string
  themeName: string
}) {
  const variants = [undefined, "primary", "danger", "gradient"] as const
  const sizes = ["small", "normal", "large"] as const
  const statuses = [
    undefined,
    ":focus",
    ":hover",
    ":active",
    "disabled",
    "loading",
  ] as const

  let seenVariant = new Set<(typeof variants)[number]>()

  const elements: JSX.Element[] = []
  for (const status of statuses) {
    let batch: JSX.Element[] = []
    for (const variant of variants) {
      let buttons: JSX.Element[] = []
      for (const size of sizes) {
        let buttonPair: JSX.Element[] = []
        for (const text of ["←", "Send Email"]) {
          buttonPair.push(
            <Button
              key={"btn" + variant + size + text}
              children={text}
              variant={variant}
              size={size}
              loading={status === "loading"}
              hover={status === ":hover"}
              active={status === ":active"}
              focus={status === ":focus"}
              disabled={status === "disabled"}
            />,
          )
        }
        buttons.push(<div className="flex gap-2">{buttonPair}</div>)
      }
      batch.push(
        <div className="flex flex-col gap-2">
          {!seenVariant.has(variant) && (
            <div className="text-lg font-medium">{variant ?? "default"}</div>
          )}
          <div>{status ?? "default"}</div>
          {buttons}
        </div>,
      )
      seenVariant.add(variant)
    }

    elements.push(<div className="flex gap-4">{batch}</div>)
  }

  return (
    <div
      className={clx(
        "rounded-md border border-solid border-[var(--color-border)] bg-[var(--color-background)] p-4 text-[var(--color-text)]",
        theme,
      )}
    >
      <h2 className="text-xl font-medium">Buttons: {themeName}</h2>
      <div className="flex flex-col gap-4">{elements}</div>
    </div>
  )
}

export function DevStoryBook() {
  return (
    <div className="flex flex-col gap-4 p-4">
      <h1 className="text-xl font-medium">Storybook</h1>
      {Object.entries(THEME_META).map(([themeId, theme]) => {
        return (
          <ButtonSection
            key={themeId}
            theme={theme.cssClass}
            themeName={theme.displayName}
          />
        )
      })}
    </div>
  )
}
