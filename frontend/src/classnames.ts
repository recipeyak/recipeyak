import uniq from "lodash/uniq"

export function classNames(
  ...args: Array<string | number | string[] | { [key: string]: boolean }>
) {
  const classes: string[] = []

  args.forEach(arg => {
    if (!arg) {
      return
    }

    if (typeof arg === "string" || typeof arg === "number") {
      classes.push(String(arg))
    } else if (Array.isArray(arg)) {
      classes.push(...arg)
    } else if (typeof arg === "object") {
      for (const key in arg) {
        if (arg.hasOwnProperty(key) && arg[key]) {
          classes.push(key)
        }
      }
    }
  })

  return uniq(classes).join(" ")
}
