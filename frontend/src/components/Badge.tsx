import { clx } from "@/classnames"

export function Badge({
  status,
  children,
}: {
  status: "success" | "error"
  children: React.ReactNode
}) {
  return (
    <div
      className={clx(
        "rounded-3xl border border-solid  px-2 py-0 text-center text-sm font-medium",
        status === "success" && "border-green-600 text-green-500",
        status === "error" && "border-red-600 text-red-500",
      )}
    >
      {children}
    </div>
  )
}
