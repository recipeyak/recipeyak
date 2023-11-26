import clx from "@/classnames"

export function Loader({ align = "center" }: { align?: "center" | "left" }) {
  return (
    <p
      className={clx(
        "text-[var(--color-text-muted)] text-sm",
        align === "center" && "text-center",
        align === "left" && "text-left",
      )}
    >
      loading...
    </p>
  )
}
