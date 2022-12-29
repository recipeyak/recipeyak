import { History } from "history"

export function setQueryParams(
  history: History<unknown>,
  paramUpdates: Record<string, string>,
) {
  const params = new URLSearchParams(window.location.search)
  Object.entries(paramUpdates).forEach(([key, value]) => {
    params.set(key, value)
  })
  void Promise.resolve().then(() => {
    // NOTE: we need to use react router history, otherwise the react version of
    // location won't update
    history.replace({
      search: "?" + params.toString(),
    })
  })
}

export function removeQueryParams(
  history: History<unknown>,

  keys: ReadonlyArray<string>,
) {
  const params = new URLSearchParams(window.location.search)
  keys.forEach((key) => {
    params.delete(key)
  })
  void Promise.resolve().then(() => {
    // NOTE: we need to use react router history, otherwise the react version of
    // location won't update
    history.replace({
      search: "?" + params.toString(),
    })
  })
}
