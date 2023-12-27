export function setItem(key: string, value: string) {
  // eslint-disable-next-line no-restricted-globals
  localStorage.setItem(key, value)
  // need to dispatch the storage event since listening for storage event is
  // only for browser tab comms
  // see: https://stackoverflow.com/a/65348883/3720597
  window.dispatchEvent(
    new StorageEvent("storage", {
      key,
      oldValue: null,
      newValue: value,
    }),
  )
}

export function removeItem(key: string) {
  // eslint-disable-next-line no-restricted-globals
  localStorage.removeItem(key)
  window.dispatchEvent(
    new StorageEvent("storage", {
      key,
      oldValue: null,
      newValue: null,
    }),
  )
}
