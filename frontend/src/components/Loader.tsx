import clx from "@/classnames"

export function Loader({ align = "center" }: { align?: "center" | "left" }) {
  return (
    <p
      className={clx(
        "text-muted text-small",
        align === "center" && "text-center",
        align === "left" && "text-left",
      )}
    >
      loading...
    </p>
  )
}
