/** Check if user has a text selection */
export function hasSelection(): boolean {
  return window.getSelection().toString().length > 0
}
