/** Check if user has a text selection */
export function hasSelection(): boolean {
  return window.getSelection().toString().length > 0
}

export function notUndefined<T>(x: T | undefined): x is T {
  return x != null
}

/** Check if the current browser is Safari
 * Note: Chrome on iOS is also considered Safari
 * from: https://stackoverflow.com/a/40921270/3720597
 */
export function isSafari(): boolean {
  return navigator.vendor === "Apple Computer, Inc."
}
