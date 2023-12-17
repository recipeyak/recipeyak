import { useCallback, useState } from "react"

import { useOnClickOutside } from "@/useOnClickOutside"

export function useDropdown() {
  const [isOpen, setIsOpen] = useState(false)
  const closeDropdown = useCallback(() => {
    setIsOpen(false)
  }, [])
  const toggle = useCallback(() => {
    setIsOpen((p) => !p)
  }, [])
  const ref = useOnClickOutside<HTMLDivElement>(closeDropdown)
  return { ref, toggle, close: closeDropdown, isOpen, setIsOpen }
}
