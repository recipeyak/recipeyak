import { useEffect, useState } from "react"

export function useLocalStorage(key: string) {
  // eslint-disable-next-line no-restricted-globals
  const [value, setValue] = useState(() => localStorage.getItem(key))

  useEffect(() => {
    // in case the key is changed in the component
    // eslint-disable-next-line no-restricted-globals
    setValue(localStorage.getItem(key))
  }, [key])
  useEffect(() => {
    // ensure a storage event causes us to read the new value
    const handleStorageChange = (event: StorageEvent) => {
      if (event.key !== key) {
        return
      }
      // eslint-disable-next-line no-restricted-globals
      const newValue = localStorage.getItem(key)
      setValue(newValue)
    }
    window.addEventListener("storage", handleStorageChange)

    return () => {
      window.removeEventListener("storage", handleStorageChange)
    }
  })

  return value
}
