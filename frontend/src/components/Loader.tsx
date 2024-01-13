import { clx } from "@/classnames"

export function Loader({ align = "center" }: { align?: "center" | "left" }) {
  return (
    // eslint-disable-next-line react/forbid-elements
    <p
      className={clx(
        "text-sm text-[--color-text-muted]",
        align === "center" && "text-center",
        align === "left" && "text-left",
      )}
    >
      loading...
    </p>
  )
}
