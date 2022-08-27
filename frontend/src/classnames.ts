import { uniq } from "lodash-es"

export function classNames(
  ...args: (
    | string
    | undefined
    | number
    | false
    | string[]
    | { [key: string]: boolean | undefined }
  )[]
): string {
  const classes: string[] = []

  args.forEach((arg) => {
    if (!arg) {
      return
    }

    if (typeof arg === "string" || typeof arg === "number") {
      classes.push(String(arg))
    } else if (Array.isArray(arg)) {
      classes.push(...arg)
    } else if (typeof arg === "object") {
      Object.keys(arg).forEach((key) => {
        if (arg[key]) {
          classes.push(key)
        }
      })
    }
  })

  return uniq(classes).join(" ")
}

export default classNames
