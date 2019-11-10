// via https://hackernoon.com/copying-text-to-clipboard-with-javascript-df4d4988697f
export function copyToClipboard(text: string) {
  const el = document.createElement("textarea")
  el.value = text
  el.setAttribute("readonly", "")
  el.style.position = "absolute"
  el.style.left = "-9999px"
  document.body.appendChild(el)
  const selection = document.getSelection()
  // save current selection
  const selected =
    selection != null && selection.rangeCount > 0
      ? selection.getRangeAt(0)
      : false
  el.select()
  document.execCommand("copy")
  // tslint:disable-next-line no-try
  try {
    document.body.removeChild(el)
  } catch (e) {
    return
  }
  // restore previous selection
  if (selected) {
    selection?.removeAllRanges()
    selection?.addRange(selected)
  }
}
