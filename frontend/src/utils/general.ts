/** Check if user has a text selection */
export function hasSelection(): boolean {
  return window.getSelection().toString().length > 0
}

export function notUndefined<T>(x: T | undefined): x is T {
  return x != null
}
