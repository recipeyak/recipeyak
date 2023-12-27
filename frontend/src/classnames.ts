import { assertNever } from "@/assert"

export function clx(...args: (string | undefined | number | false)[]): string {
  const classes = new Set<string>()
  for (const arg of args) {
    if (!arg) {
      continue
    } else if (typeof arg === "string" || typeof arg === "number") {
      classes.add(String(arg))
    } else {
      assertNever(arg)
    }
  }
  return [...classes].join(" ")
}
