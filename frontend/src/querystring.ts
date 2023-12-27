import { History } from "history"

export function setQueryParams(
  history: History<unknown>,
  paramUpdates: Record<string, string>,
) {
  const search = addQueryParams(history.location.search, paramUpdates)
  void Promise.resolve().then(() => {
    // NOTE: we need to use react router history, otherwise the react version of
    // location won't update
    history.replace({
      search,
    })
  })
}

export function addQueryParams(
  search: string,
  paramUpdates: Record<string, string>,
): string {
  const params = new URLSearchParams(search)
  Object.entries(paramUpdates).forEach(([key, value]) => {
    params.set(key, value)
  })
  return "?" + params.toString()
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
