export const inputAbs = (v: string) => {
  const c = v.replace(/[^\d]/g, "")
  return c.length === 0 ? 0 : parseInt(c, 10)
}

export function isInputFocused() {
  const activeElement = document.activeElement
  return (
    activeElement !== document.body &&
    activeElement !== null &&
    ((activeElement.tagName === "INPUT" &&
      activeElement.getAttribute("type") !== "button") ||
      activeElement.tagName === "TEXTAREA")
  )
}
