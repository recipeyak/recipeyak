import {
  addDays,
  eachDayOfInterval,
  format,
  parseISO,
  startOfToday,
} from "date-fns"
import React, { useEffect } from "react"
import { Link, useHistory } from "react-router-dom"
import useOnClickOutside from "use-onclickoutside"

import { isMobile } from "@/browser"
import { Box } from "@/components/Box"
import * as forms from "@/components/Forms"
import { Helmet } from "@/components/Helmet"
import { Image } from "@/components/Image"
import { Loader } from "@/components/Loader"
import { NavPage } from "@/components/Page"
import { Tag } from "@/components/Tag"
import { pathRecipeDetail, pathRecipesList, pathSchedule } from "@/paths"
import { useRecentlyCreatedRecipesList } from "@/queries/recentlyCreatedRecipesList"
import { useRecentlyViewedRecipesList } from "@/queries/recentlyViewedRecipesList"
import { RecipeListItem, useRecipeList } from "@/queries/recipeList"
import { useSchedulePreviewList } from "@/queries/schedulePreviewList"
import { removeQueryParams, setQueryParams } from "@/querystring"
import { Match, searchRecipes } from "@/search"
import { css, styled } from "@/theme"
import { imgixFmt } from "@/url"
import { useTeamId } from "@/useTeamId"

const SearchInput = styled(forms.SearchInput)`
  margin-bottom: 0.25rem;
  font-size: 18px;
`

function Code({ children }: { children: React.ReactNode }) {
  return (
    <code
      className="mx-[2px] my-0 whitespace-pre rounded-[3px] border border-solid border-[#ddd] bg-[var(--color-background-card)] px-[5px] py-0 font-[var(--color-text)]"
      children={children}
    />
  )
}

function SectionTitle({ children }: { children: React.ReactNode }) {
  return <div className="pb-1 text-base font-medium">{children}</div>
}

function ScheduledRecipe(props: {
  readonly day: string
  readonly recipes: Recipe[]
}) {
  return (
    <Box>
      <div className="mr-2 min-w-[2.5rem] text-right text-[14px] font-bold">
        {props.day}
      </div>
      <Box gap={1} dir="col" grow={1}>
        {props.recipes.length === 0 ? (
          <div className="text-[var(--color-text-muted)]">—</div>
        ) : null}
        {props.recipes.map((x) => (
          <RecipeSlide key={x.id} recipe={x} />
        ))}
      </Box>
    </Box>
  )
}

// TODO: make this take up the full width on mobile
const ScheduleContainer = styled.div`
  width: 100%;
  @media (min-width: 530px) {
    max-width: 350px;
    width: 350px;
  }
  border-radius: 6px;
  padding: 0.75rem;
  border: 1px solid var(--color-border);
  font-size: 14px;
`

const SuggestionBox = styled.div`
  background: var(--color-background-card);
  width: 100%;
  border-style: solid;
  border-width: 1px;
  border-color: var(--color-border);
  border-radius: 5px;
  padding: 0.25rem;
  display: inline-grid;
`

const suggestionStyle = css`
  padding: 0.25rem 0.25rem;

  overflow-x: hidden;
  white-space: nowrap;
  text-overflow: ellipsis;
`

const SuggestionInfo = styled.div`
  ${suggestionStyle}
  text-align: center;
  color: ${(props) => props.theme.color.muted};
`

const SuggestionItem = styled(Link)<{
  readonly firstItem?: boolean
  readonly archived?: boolean
}>`
  ${suggestionStyle}
  // Underline the first item because we navigate to it on "Enter".
  ${(props) =>
    props.firstItem &&
    css`
      text-decoration: underline;
    `}
  ${(props) =>
    props.archived &&
    css`
      color: ${props.theme.color.muted};
    `}
`
const RecipeMatchPiece = styled.div<{ readonly firstItem?: boolean }>`
  margin-left: 1rem;
  font-weight: bold;
`

const SuggestionAuthor = styled.span<{ readonly bold: boolean }>`
  font-weight: ${(props) => (props.bold ? "bold" : "normal")};
`
const RecipeName = styled.span<{ readonly bold: boolean }>`
  font-weight: ${(props) => (props.bold ? "bold" : "normal")};
  flex-grow: 0;
  overflow-x: hidden;
  text-overflow: ellipsis;
  white-space: pre;
`

const BrowseRecipesContainer = styled.div`
  ${suggestionStyle}
  border-top-style: solid;
  border-top-width: 1px;
  border-color: #f2f2f2;
  margin-top: 0.5rem;
  display: flex;
  justify-content: space-between;
`

type Recipe = {
  readonly id: number | string
  readonly name: string
  readonly author: string | null
  readonly archivedAt: string | null
  readonly primaryImage: {
    id: number | string
    url: string
    backgroundUrl: string | null
  } | null
}
type RecipeSchedule = { readonly day: string; readonly recipes: Recipe[] }

function buildSchedule(
  schedule: readonly {
    readonly on: string
    readonly recipe: Recipe
  }[],
  start: Date,
  end: Date,
): readonly RecipeSchedule[] {
  const newSchedule: {
    [key: string]: Recipe[] | undefined
  } = {}
  eachDayOfInterval({
    start,
    end,
  }).forEach((day) => {
    newSchedule[day.toISOString()] = []
  })
  schedule.forEach((x) => {
    const date = parseISO(x.on)
    const s = newSchedule[date.toISOString()]
    if (s == null) {
      newSchedule[date.toISOString()] = []
    }
    newSchedule[date.toISOString()]?.push({
      id: x.recipe.id,
      name: x.recipe.name,
      author: x.recipe.author,
      archivedAt: x.recipe.archivedAt,
      primaryImage: x.recipe.primaryImage,
    })
  })
  return Object.entries(newSchedule).map(([key, value]): RecipeSchedule => {
    return { day: format(parseISO(key), "E"), recipes: value || [] }
  })
}

function useSchedulePreview() {
  const start = startOfToday()
  const end = addDays(start, 6)
  const res = useSchedulePreviewList({ start, end })

  if (res.data == null) {
    return null
  }
  return buildSchedule(
    res.data.scheduledRecipes.map((scheduledRecipe) => ({
      on: scheduledRecipe.on,
      recipe: {
        id: scheduledRecipe.recipe.id.toString(),
        name: scheduledRecipe.recipe.name,
        author: scheduledRecipe.recipe.author,
        archivedAt: scheduledRecipe.recipe.archivedAt,
        primaryImage: scheduledRecipe.recipe.primaryImage,
      },
    })),
    start,
    end,
  )
}

function SchedulePreview() {
  const scheduledRecipes = useSchedulePreview()
  const teamId = useTeamId()
  return (
    <ScheduleContainer>
      <Link to={pathSchedule({ teamId: teamId.toString() })}>
        <SectionTitle>Schedule</SectionTitle>
      </Link>
      <Box gap={2} dir="col">
        {scheduledRecipes?.map((x) => (
          <ScheduledRecipe key={x.day} day={x.day} recipes={x.recipes} />
        ))}
      </Box>
    </ScheduleContainer>
  )
}

function RecipeSlide({ recipe: r }: { recipe: Recipe }) {
  return (
    <Link key={r.id} to={pathRecipeDetail({ recipeId: r.id.toString() })}>
      <Box key={r.id} gap={2}>
        <Image
          width={48}
          height={48}
          grayscale={!!r.archivedAt}
          sources={
            r.primaryImage && {
              url: imgixFmt(r.primaryImage.url),
              backgroundUrl: r.primaryImage.backgroundUrl,
            }
          }
          rounded
        />
        <Box dir="col" w={100}>
          <div className="line-clamp-1 text-ellipsis">{r.name}</div>
          <small className="line-clamp-1 text-ellipsis">{r.author}</small>
        </Box>
      </Box>
    </Link>
  )
}

function RecentlyViewed() {
  const recipes = useRecentlyViewedRecipesList()

  return (
    <ScheduleContainer>
      <SectionTitle>Recently Viewed</SectionTitle>
      <Box dir="col" gap={2}>
        {recipes.isError ? (
          <div>error loading</div>
        ) : recipes.data == null ? (
          <Loader align="left" />
        ) : recipes.data.length === 0 ? (
          <div>no recipes viewed</div>
        ) : (
          recipes.data.map((r) => <RecipeSlide key={r.id} recipe={r} />)
        )}
      </Box>
    </ScheduleContainer>
  )
}

function RecentlyCreated() {
  const recipes = useRecentlyCreatedRecipesList()

  return (
    <ScheduleContainer>
      <SectionTitle>Recently Created</SectionTitle>
      <Box dir="col" gap={2}>
        {recipes.isError ? (
          <div>error loading</div>
        ) : recipes.data == null ? (
          <Loader align="left" />
        ) : recipes.data.length === 0 ? (
          <p>no recipes viewed</p>
        ) : (
          recipes.data.map((r) => <RecipeSlide key={r.id} recipe={r} />)
        )}
      </Box>
    </ScheduleContainer>
  )
}

function searchQueryFromUrl() {
  return new URLSearchParams(window.location.search).get("search") ?? ""
}

export function SearchResult({
  isLoading,
  searchResults,
  searchQuery,
  onClick,
}: {
  searchQuery: string
  isLoading: boolean
  onClick?: () => void
  searchResults: {
    readonly recipe: RecipeListItem
    readonly match: Match[]
  }[]
}) {
  const suggestions = searchResults
    .map((result, index) => {
      const { recipe, match: matches } = result

      const nameMatch = matches.find((x) => x.kind === "name")
      const ingredientMatch = matches.find((x) => x.kind === "ingredient")
      const tagMatch = matches.find((x) => x.kind === "tag")
      const authorMatch = matches.find((x) => x.kind === "author")

      return (
        <SuggestionItem
          key={recipe.id}
          archived={recipe.archived_at != null}
          to={pathRecipeDetail({ recipeId: recipe.id.toString() })}
          firstItem={index === 0}
        >
          <div className="flex">
            <RecipeName bold={nameMatch != null}>{recipe.name} </RecipeName>
            {recipe.author && (
              <span className="grow">
                by{" "}
                <SuggestionAuthor bold={authorMatch != null}>
                  {recipe.author}
                </SuggestionAuthor>
              </span>
            )}
          </div>
          {ingredientMatch != null ? (
            <RecipeMatchPiece>{ingredientMatch.value}</RecipeMatchPiece>
          ) : null}
          {tagMatch != null ? <Tag>{tagMatch.value}</Tag> : null}
        </SuggestionItem>
      )
    })
    .slice(0, 7)
  return (
    <SuggestionBox onClick={onClick}>
      {!isLoading ? (
        <>
          {searchResults.length === 0 && (
            <SuggestionInfo>No Results Found</SuggestionInfo>
          )}
          {suggestions}
          <BrowseRecipesContainer>
            <span className="text-[var(--color-text-muted)]">
              matches: {searchResults.length}
            </span>

            <Link
              to={{
                pathname: pathRecipesList({}),
                search: `search=${encodeURIComponent(searchQuery)}`,
              }}
              data-testid="search browse"
            >
              Browse
            </Link>
          </BrowseRecipesContainer>
        </>
      ) : (
        <SuggestionInfo>Loading...</SuggestionInfo>
      )}
    </SuggestionBox>
  )
}

/**
 * Implementation is very similar to "Search" in Nav.tsx.
 */
function Search() {
  const history = useHistory()
  const [searchQuery, setSearchQuery] =
    React.useState<string>(searchQueryFromUrl)
  const recipes = useRecipeList()
  const setQuery = React.useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      setSearchQuery(event.target.value)
    },
    [],
  )

  const ref = React.useRef(null)
  // close our search panel and clear our search query when we click outside our
  // dropdown.
  useOnClickOutside(ref, () => {
    setSearchQuery("")
  })

  useEffect(() => {
    const newSearchQuery = searchQuery || ""
    if (newSearchQuery.length === 0) {
      removeQueryParams(history, ["search"])
    } else {
      setQueryParams(history, { search: newSearchQuery })
    }
  }, [searchQuery, history])

  const filteredRecipes = recipes.isSuccess
    ? searchRecipes({ recipes: recipes.data, query: searchQuery })
    : { recipes: [] }

  const handleSearchKeydown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    // We need to extract the key from the synthetic event before we lose the
    // event.
    const key = e.key
    const suggestion = filteredRecipes.recipes[0]
    if (!suggestion) {
      return
    }
    if (key === "Enter") {
      history.push(
        pathRecipeDetail({ recipeId: suggestion.recipe.id.toString() }),
      )
    }
  }

  return (
    <div className="flex justify-center py-4">
      <div ref={ref} className="relative flex max-w-[400px] grow flex-col">
        <SearchInput
          autoFocus={!isMobile()}
          autoCorrect="false"
          autoComplete="false"
          autoCapitalize="false"
          spellCheck="false"
          value={searchQuery}
          onChange={setQuery}
          onKeyDown={handleSearchKeydown}
          placeholder="Search your recipes..."
        />
        {searchQuery && (
          <div className="absolute top-[60px] z-10 w-full max-w-[400px]">
            <SearchResult
              isLoading={recipes.isLoading}
              searchQuery={searchQuery}
              searchResults={filteredRecipes.recipes}
            />
          </div>
        )}
        <div className="text-[12px] text-[var(--color-text-muted)]">
          fields <Code>author:Jane Doe</Code>, <Code>ingredient:onions</Code>,{" "}
          <Code>name:cake</Code>
        </div>
      </div>
    </div>
  )
}

export const UserHome = () => {
  return (
    <NavPage includeSearch={false}>
      <Helmet title="Home" />
      <Search />
      <div className="flex flex-wrap items-start justify-center gap-4">
        <SchedulePreview />
        <RecentlyViewed />
        <RecentlyCreated />
      </div>
    </NavPage>
  )
}
