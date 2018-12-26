import uniq from "lodash/uniq"

export function classNames(
  ...args: ReadonlyArray<

      | string
      | number
      | ReadonlyArray<string>
      | { readonly [key: string]: boolean }
  >
) {
  const classes: ReadonlyArray<string> = []

  args.forEach(arg => {
    if (!arg) {
      return
    }

    if (typeof arg === "string" || typeof arg === "number") {
      classes.push(String(arg))
    } else if (Array.isArray(arg)) {
      classes.push(...arg)
    } else if (typeof arg === "object") {
      Object.keys(arg).forEach(key => {
        if (arg[key]) {
          classes.push(key)
        }
      })
    }
  })

  return uniq(classes).join(" ")
}
