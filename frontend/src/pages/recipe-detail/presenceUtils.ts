import { orderBy, uniqBy } from "lodash-es"

export function uniqPresense<
  T extends { clientId: string; data: { active?: boolean } },
>(presences: Array<T>) {
  return uniqBy(
    orderBy(
      presences,
      [(x) => x.clientId, (x) => (x.data.active ? 1 : 0)],
      ["asc", "desc"],
    ),
    (x) => x.clientId,
  )
}
