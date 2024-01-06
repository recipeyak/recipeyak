import { useEffect, useRef, useState } from "react"
import { useHistory, useLocation } from "react-router"

import { Button } from "@/components/Buttons"
import { SearchInput } from "@/components/Forms"
import { Matches, RecipeList } from "@/components/RecipeSearchList"
import { useSearchRecipeFacets } from "@/queries/searchRecipeFacets"
import { useSearchRecipes } from "@/queries/searchRecipes"
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
    <div className="flex max-h-48 min-h-48 min-w-48 max-w-48 flex-col">
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

function ArchivedToggle({
  onChange,
  facetFilters,
}: {
  facetFilters: {
    OrArchived: boolean
    AndNeverScheduled: boolean
  }
  onChange: (
    _:
      | {
          OrArchived: boolean
        }
      | {
          AndNeverScheduled: boolean
        },
  ) => void
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
        <label htmlFor="archived_recipes">Include archived recipes</label>
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
        <label htmlFor="never_scheduled">
          Limit to never scheduled recipes
        </label>
      </div>
    </div>
  )
}
type SearchFieldOptions = "name_author" | "ingredient_name"

type FacetFilters = {
  OrArchived: boolean
  AndNeverScheduled: boolean
  tags: string[]
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

export function RecipeSearchList() {
  const [showAdvanced, setAdvanced] = useState(false)
  const [searchBy, setSearchBy] = useState<SearchFieldOptions>("name_author")
  const location = useLocation()
  const [query, setQuery] = useState(() => {
    const query = new URLSearchParams(location.search).get("search")
    return query ?? ""
  })

  useUpdateQueryParams(query)

  const indexName = searchBy === "name_author" ? "recipes" : "ingredients"

  const [facetFilters, setFacetFilters] = useState<FacetFilters>({
    OrArchived: false,
    AndNeverScheduled: false,
    tags: [],
  })

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
        placeholder="search"
      />
      <div className="flex flex-col gap-2">
        <div className="flex gap-1">
          <div className="flex flex-col">
            {showAdvanced && (
              <div className="flex flex-wrap gap-2">
                <div className="flex max-h-48 min-h-48 min-w-48 max-w-48 flex-col ">
                  <label className="font-medium">Search by</label>
                  <div className="flex items-center gap-2">
                    <input
                      type="radio"
                      id="name_author"
                      name="search_by"
                      defaultChecked
                      defaultValue={"name_author"}
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
                  onChange={(value) => {
                    setFacetFilters((s) => ({ ...s, ...value }))
                  }}
                />
                <ArchivedToggle
                  facetFilters={facetFilters}
                  onChange={(value) => {
                    setFacetFilters((s) => ({ ...s, ...value }))
                  }}
                />
              </div>
            )}
            <Matches
              nbHits={totalCount}
              archivedCount={archivedCount}
              showArchived={showArchived}
            />
          </div>
          <div className="ml-auto">
            <Button
              size="small"
              onClick={() => {
                setAdvanced((s) => !s)
              }}
            >
              {showAdvanced ? "hide search tools" : "search tools"}
            </Button>
          </div>
        </div>
        <RecipeList
          hits={hits}
          className="w-full"
          advancedSearch={showAdvanced}
          query={query}
          isSuccess={results.isSuccess}
        />
      </div>
    </div>
  )
}
