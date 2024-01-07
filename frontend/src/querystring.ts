import { History } from "history"

export function setQueryParams(
  history: History<unknown>,
  paramUpdates: Record<string, string | Array<string> | undefined>,
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
  paramUpdates: Record<string, string | string[] | undefined>,
): string {
  const params = new URLSearchParams(search)
  Object.entries(paramUpdates).forEach(([key, value]) => {
    if (value === undefined) {
      params.delete(key)
    } else if (Array.isArray(value)) {
      params.delete(key)
      for (const val of value) {
        params.append(key, val)
      }
    } else {
      params.set(key, value)
    }
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
