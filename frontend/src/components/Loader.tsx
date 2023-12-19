import { clx } from "@/classnames"

export function Loader({ align = "center" }: { align?: "center" | "left" }) {
  return (
    // TODO: Fix this the next time the file is edited.
    // eslint-disable-next-line react/forbid-elements
    <p
      className={clx(
        "text-sm text-[var(--color-text-muted)]",
        align === "center" && "text-center",
        align === "left" && "text-left",
      )}
    >
      loading...
    </p>
  )
}
