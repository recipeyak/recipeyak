import { isURL, urlToDomain } from "@/text"

export function RecipeSource({ source }: { source: string }) {
  return isURL(source) ? (
    <a href={source}>{urlToDomain(source)}</a>
  ) : (
    <>{source}</>
  )
}
