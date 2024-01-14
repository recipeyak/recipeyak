import { snakeCase } from "lodash-es"
import { useEffect, useRef, useState } from "react"
import { useHistory, useLocation } from "react-router"

import { Button } from "@/components/Buttons"
import { SearchInput } from "@/components/Forms"
import { Matches, RecipeList } from "@/components/RecipeSearchList"
import { useSearchRecipeFacets } from "@/queries/searchRecipeFacets"
import { useSearchRecipes } from "@/queries/searchRecipes"
import { useUserById } from "@/queries/userById"
import { removeQueryParams, setQueryParams } from "@/querystring"

function CustomRefinement({
  indexName,
  attribute,
  label,
  onChange,
  facetFilters,
}: {
  indexName: "recipes" | "ingredients"
  attribute: "tags"
  label: string
  onChange: (_: { tags: string[] }) => void
  facetFilters: { tags: string[] }
}) {
  const [facetQuery, setFacetQuery] = useState("")
  const facetResults = useSearchRecipeFacets({
    indexName,
    facetName: attribute,
    facetQuery,
  })

  const items = facetResults.data?.[0].facetHits ?? []

  return (
    <div className="flex w-full flex-col  sm:max-h-48 sm:min-h-48 sm:w-fit ">
      <div className="font-medium">{label}</div>
      <SearchInput
        placeholder="search..."
        onChange={(e) => {
          setFacetQuery(e.target.value)
        }}
      />
      <div>
        {items.map((item) => {
          const itemIsRefined = facetFilters[attribute].includes(item.value)
          return (
            <div key={item.value} className="flex items-center gap-2">
              <input
                type="checkbox"
                id={label + item.value}
                checked={itemIsRefined}
                onChange={(e) => {
                  if (!e.target.checked) {
                    onChange({
                      [attribute]: facetFilters[attribute].filter(
                        (x) => x !== item.value,
                      ),
                    })
                  } else {
                    onChange({
                      [attribute]: facetFilters[attribute].concat(item.value),
                    })
                  }
                }}
              />
              <label
                htmlFor={label + item.value}
                className="overflow-x-hidden text-ellipsis whitespace-nowrap"
              >
                {item.value}
              </label>
            </div>
          )
        })}
      </div>
    </div>
  )
}

function UserToggleFilter({
  userId,
  prefixLabel,
  onClick,
}: {
  onClick: () => void
  userId: string
  prefixLabel: string
}) {
  const user = useUserById({
    id: userId,
  })
  if (user.data == null) {
    return null
  }
  return (
    <div className="flex items-center gap-2">
      <input
        id={`user_toggle_filter_${snakeCase(prefixLabel)}`}
        type="checkbox"
        defaultChecked={true}
        onChange={onClick}
      />
      <label htmlFor={`user_toggle_filter_${snakeCase(prefixLabel)}`}>
        {prefixLabel} {user.data.name}
      </label>
    </div>
  )
}

const userToggleFilters = [
  { key: "AndCreatedById", label: "Created by" },
  { key: "AndArchivedById", label: "Archived by" },
  { key: "AndScheduledById", label: "Scheduled by" },
  { key: "AndPrimaryImageCreatedById", label: "Primary image created by" },
] as const

function RecipesToggle({
  onChange,
  facetFilters,
}: {
  facetFilters: FacetFilters
  onChange: (_: Partial<FacetFilters>) => void
}) {
  return (
    <div>
      <div className="font-medium">Recipes</div>
      <div className="flex items-center gap-2">
        <input
          id="archived_recipes"
          type="checkbox"
          checked={facetFilters.OrArchived}
          onChange={(event) => {
            const isRefined = event.target.checked
            if (isRefined) {
              onChange({ OrArchived: true })
            } else {
              onChange({ OrArchived: false })
            }
          }}
        />
        <label htmlFor="archived_recipes">Archived recipes</label>
      </div>
      <div className="flex items-center gap-2">
        <input
          id="never_scheduled"
          type="checkbox"
          checked={facetFilters.AndNeverScheduled}
          onChange={(event) => {
            const isRefined = event.target.checked
            if (isRefined) {
              onChange({ AndNeverScheduled: true })
            } else {
              onChange({ AndNeverScheduled: false })
            }
          }}
        />
        <label htmlFor="never_scheduled">Never scheduled recipes</label>
      </div>

      {userToggleFilters.map((filter) => {
        const id = facetFilters[filter.key]
        if (id == null) {
          return null
        }
        return (
          <UserToggleFilter
            key={filter.key}
            userId={id}
            prefixLabel={filter.label}
            onClick={() => {
              onChange({ [filter.key]: null })
            }}
          />
        )
      })}
    </div>
  )
}
type SearchFieldOptions = "name_author" | "ingredient_name"

type FacetFilters = {
  OrArchived: boolean
  AndNeverScheduled: boolean
  tags: string[]
  AndCreatedById: string | null
  AndArchivedById: string | null
  AndScheduledById: string | null
  AndPrimaryImageCreatedById: string | null
}

function serializeFacetFilters(
  facetFilters: FacetFilters,
): Array<string | Array<string>> {
  let filters: Array<string | Array<string>> = []
  for (const [key, value] of Object.entries(facetFilters)) {
    if (key === "OrArchived" && value === false) {
      filters.push("archived:false")
    } else if (key === "AndNeverScheduled" && value === true) {
      filters.push("scheduled_count_all_time:0")
    } else if (key === "tags" && Array.isArray(value) && value.length > 0) {
      const tags: string[] = []
      for (const tag of value) {
        tags.push(`tags:${tag}`)
      }
      filters.push(tags)
    } else if (key === "AndCreatedById" && value != null) {
      filters.push(`created_by_id:${value}`)
    } else if (key === "AndArchivedById" && value != null) {
      filters.push(`archived_by_id:${value}`)
    } else if (key === "AndScheduledById" && value != null) {
      filters.push(`scheduled_by_id:${value}`)
    } else if (key === "AndPrimaryImageCreatedById" && value != null) {
      filters.push(`primary_image.created_by_id:${value}`)
    }
  }
  return filters
}

function useThrottle(value: string, interval: number = 500) {
  const [throttledValue, setThrottledValue] = useState(value)
  const lastUpdated = useRef<number | null>(null)

  useEffect(() => {
    const now = Date.now()

    if (lastUpdated.current && now >= lastUpdated.current + interval) {
      lastUpdated.current = now
      setThrottledValue(value)
    } else {
      const id = window.setTimeout(() => {
        lastUpdated.current = now
        setThrottledValue(value)
      }, interval)

      return () => {
        window.clearTimeout(id)
      }
    }
  }, [value, interval])

  return throttledValue
}

function useUpdateQueryParams(query: string) {
  const throttledQuery = useThrottle(query)
  const history = useHistory()

  useEffect(() => {
    if (throttledQuery === "") {
      removeQueryParams(history, ["search"])
    } else {
      setQueryParams(history, { search: throttledQuery })
    }
  }, [history, throttledQuery])
}

function useSearchTools() {
  const history = useHistory()
  const [showAdvanced, setAdvanced] = useState<boolean>(() => {
    const params = new URLSearchParams(window.location.search)
    return params.get("search_tools") === "1"
  })

  function toggle() {
    setAdvanced((s) => {
      if (s) {
        removeQueryParams(history, ["search_tools"])
        return false
      }
      setQueryParams(history, { search_tools: "1" })
      return true
    })
  }

  return {
    enabled: showAdvanced,
    toggle,
  } as const
}

function useSearchByState() {
  const location = useLocation()
  const history = useHistory()
  const [searchBy, setSearchByState] = useState<SearchFieldOptions>(() => {
    const params = new URLSearchParams(location.search)
    const searchByParam = params.get("search_by")
    if (
      searchByParam === "name_author" ||
      searchByParam === "ingredient_name"
    ) {
      return searchByParam
    }
    return "name_author"
  })

  function setSearchBy(x: SearchFieldOptions) {
    setQueryParams(history, {
      search_by: x,
    })
    setSearchByState(x)
  }
  return [searchBy, setSearchBy] as const
}

function useFacetFiltersState() {
  const location = useLocation()
  const history = useHistory()
  const [facetFilters, setFacetFilterState] = useState<FacetFilters>(() => {
    const params = new URLSearchParams(location.search)

    return {
      OrArchived: params.get("or_archived") === "1",
      AndNeverScheduled: params.get("and_never_scheduled") === "1",
      tags: params.getAll("tag"),
      AndCreatedById: params.get("created_by_id"),
      AndArchivedById: params.get("archived_by_id"),
      AndScheduledById: params.get("scheduled_by_id"),
      AndPrimaryImageCreatedById: params.get("primary_image_created_by_id"),
    }
  })

  function setFacetFilters(x: Partial<FacetFilters>) {
    if ("AndNeverScheduled" in x) {
      setQueryParams(history, {
        and_never_scheduled: x.AndNeverScheduled ? "1" : undefined,
      })
    }
    if ("OrArchived" in x) {
      setQueryParams(history, { or_archived: x.OrArchived ? "1" : undefined })
    }
    if ("tags" in x) {
      setQueryParams(history, { tag: x.tags ?? [] })
    }
    if ("AndCreatedById" in x) {
      setQueryParams(history, {
        created_by_id: x.AndCreatedById ?? undefined,
      })
    }
    if ("AndArchivedById" in x) {
      setQueryParams(history, {
        archived_by_id: x.AndArchivedById ?? undefined,
      })
    }
    if ("AndScheduledById" in x) {
      setQueryParams(history, {
        scheduled_by_id: x.AndScheduledById ?? undefined,
      })
    }
    if ("AndPrimaryImageCreatedById" in x) {
      setQueryParams(history, {
        primary_image_created_by_id: x.AndPrimaryImageCreatedById ?? undefined,
      })
    }
    setFacetFilterState((s) => ({ ...s, ...x }))
  }
  return [facetFilters, setFacetFilters] as const
}

function useSearchState() {
  const location = useLocation()
  const [query, setQuery] = useState(() => {
    const query = new URLSearchParams(location.search).get("search")
    return query ?? ""
  })
  return [query, setQuery] as const
}

export function RecipeSearchList() {
  const searchTools = useSearchTools()
  const [searchBy, setSearchBy] = useSearchByState()
  const [query, setQuery] = useSearchState()
  const [facetFilters, setFacetFilters] = useFacetFiltersState()

  useUpdateQueryParams(query)

  const indexName = searchBy === "name_author" ? "recipes" : "ingredients"

  const serializedFacetFilters = facetFilters
    ? serializeFacetFilters(facetFilters)
    : []

  const results = useSearchRecipes({
    query,
    indexName,
    facetFilters: serializedFacetFilters,
    limit: 1000,
  })

  const totalCount = results.data?.result.nbHits ?? 0
  const hits = results.data?.hits ?? []
  const showArchived = facetFilters.OrArchived === false
  const archivedCount =
    results.data?.archivedFacetData.facets?.["archived"]?.["true"] ?? 0

  return (
    <div className="mx-auto flex max-w-[1000px] flex-col gap-2">
      <SearchInput
        value={query}
        onChange={(e) => {
          setQuery(e.target.value)
        }}
        placeholder={
          searchBy === "name_author"
            ? "search by title & author..."
            : "search by ingredient..."
        }
      />
      <div className="flex flex-col gap-2">
        <div className="flex w-full items-center justify-between">
          <Matches
            nbHits={totalCount}
            archivedCount={archivedCount}
            showArchived={showArchived}
          />

          <Button size="small" onClick={searchTools.toggle}>
            {searchTools.enabled ? "Hide Search Tools" : "Search Tools"}
          </Button>
        </div>

        {searchTools.enabled && (
          <div
            className="flex w-full flex-wrap gap-x-6
          sm:w-fit"
          >
            <div className="flex flex-col">
              <label className="font-medium">Search by</label>
              <div className="flex items-center gap-2">
                <input
                  type="radio"
                  id="name_author"
                  name="search_by"
                  defaultChecked={searchBy === "name_author"}
                  onChange={() => {
                    setSearchBy("name_author")
                  }}
                />
                <label htmlFor="name_author">name & author</label>
              </div>
              <div className="flex items-center gap-2">
                <input
                  type="radio"
                  name="search_by"
                  id="ingredient_name"
                  defaultChecked={searchBy === "ingredient_name"}
                  onChange={() => {
                    setSearchBy("ingredient_name")
                  }}
                />
                <label htmlFor="ingredient_name">ingredient name</label>
              </div>
            </div>
            <CustomRefinement
              indexName={indexName}
              facetFilters={facetFilters}
              label="Tags"
              attribute="tags"
              onChange={setFacetFilters}
            />
            <RecipesToggle
              facetFilters={facetFilters}
              onChange={setFacetFilters}
            />
          </div>
        )}

        <RecipeList
          hits={hits}
          className="w-full"
          advancedSearch={searchTools.enabled}
          query={query}
          isSuccess={results.isSuccess}
        />
      </div>
    </div>
  )
}
