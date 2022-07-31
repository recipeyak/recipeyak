import GlobalEvent from "@/components/GlobalEvent"
export const heldKeys = new Set<string>()

export function CurrentKeys() {
  const handleKeyDown = (e: KeyboardEvent) => {
    heldKeys.add(e.key)
  }
  const handleKeyUp = (e: KeyboardEvent) => {
    heldKeys.delete(e.key)
  }
  return <GlobalEvent keyDown={handleKeyDown} keyUp={handleKeyUp} />
}
