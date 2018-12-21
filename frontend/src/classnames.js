import uniq from "lodash/uniq";

export function classNames(...args) {
  const classes = [];

  args.forEach(arg => {
    if (!arg) return;

    const argType = typeof arg;
    if (argType === "string" || argType === "number") {
      classes.push(arg);
    } else if (Array.isArray(arg)) {
      classNames.push(...arg);
    } else if (argType === "object") {
      for (const key in arg) {
        if (arg.hasOwnProperty(key) && arg[key]) {
          classes.push(key);
        }
      }
    }
  });

  return uniq(classes).join(" ");
}
