import queryString from "query-string"

export function updateQueryString(
  params: { [key: string]: string | undefined },
  querystring: string,
): string {
  const parsed = queryString.parse(querystring)
  return queryString.stringify({ ...parsed, ...params })
}
