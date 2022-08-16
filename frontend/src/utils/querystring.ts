import queryString from "query-string"

export function updateQueryString(
  params: { [key: string]: string | undefined },
  querystring: string,
): string {
  const parsed = queryString.parse(querystring)
  return queryString.stringify({ ...parsed, ...params })
}
export function updateQueryParamsAsync(params: Record<string, string>) {
  const queryParams = queryString.parse(window.location.search)

  void Promise.resolve().then(() => {
    history.replaceState(
      null,
      "",
      "?" + queryString.stringify({ ...queryParams, ...params }),
    )
  })
}
