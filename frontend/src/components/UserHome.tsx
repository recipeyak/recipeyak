import { push } from "connected-react-router"
import {
  addDays,
  eachDayOfInterval,
  format,
  parseISO,
  startOfToday,
} from "date-fns"
import React, { useEffect } from "react"
import { Link } from "react-router-dom"

import * as api from "@/api"
import Footer from "@/components/Footer"
import { TextInput } from "@/components/Forms"
import { Helmet } from "@/components/Helmet"
import { useApi, useDispatch, useScheduleTeamID, useSelector } from "@/hooks"
import { searchRecipes } from "@/search"
import { getTeamRecipes } from "@/store/reducers/recipes"
import { fetchingRecipeListAsync } from "@/store/thunks"
import { css, styled } from "@/theme"
import { isFailure, isSuccess, mapSuccessLike } from "@/webdata"

const SearchInput = styled(TextInput)`
  font-size: 1.5rem !important;
  margin-bottom: 0.25rem;
`

const SearchInputAligner = styled.div`
  display: flex;
  justify-content: center;
  padding-top: 1rem;
  padding-bottom: 4rem;
`

const SearchInputContainer = styled.div`
  max-width: 400px;
  display: flex;
  flex-direction: column;
  flex-grow: 1;
  position: relative;
`

const SearchOptions = styled.div`
  font-size: 0.85rem;
  color: ${(props) => props.theme.color.muted};
`

const Code = styled.code`
  margin: 0 2px;
  padding: 0px 5px;
  border: 1px solid #ddd;
  background-color: #f8f8f8;
  border-radius: 3px;
  color: inherit;
  white-space: pre;
`

const SectionTitle = styled.div`
  font-size: 1.25rem;
`

const ScheduledRecipeContainer = styled.div`
  display: flex;
`
const Day = styled.div`
  font-weight: bold;
  text-align: right;
  min-width: 2.5rem;
  margin-right: 0.5rem;
  color: hsl(0 0% 40% / 1);
`
const Recipes = styled.div`
  display: inline-grid;
`

const Recipe = styled(Link)`
  font-weight: bold;
  overflow-x: hidden;
  white-space: nowrap;
  text-overflow: ellipsis;
`

function ScheduledRecipe(props: {
  readonly day: string
  readonly recipes: { readonly id: string; readonly name: string }[]
}) {
  return (
    <ScheduledRecipeContainer>
      <Day>{props.day}</Day>
      <Recipes>
        {props.recipes.length === 0 ? (
          <div className="text-muted">—</div>
        ) : null}
        {props.recipes.map((x) => (
          <Recipe key={x.id} to={`/recipes/${x.id}`}>
            {x.name}
          </Recipe>
        ))}
      </Recipes>
    </ScheduledRecipeContainer>
  )
}
const ScheduleContainer = styled.div`
  max-width: 300px;
`

const SuggestionBox = styled.div`
  position: absolute;
  z-index: 10;
  top: 60px;
  background: white;
  max-width: 400px;
  width: 100%;
  border-style: solid;
  border-width: 1px;
  border-color: #dddd;
  border-radius: 5px;
  box-shadow: 0px 4px 5px 0px hsl(0 0% 90% / 1);
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
const SuggestionAuthorContainer = styled.span`
  flex-grow: 1;
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
const MatchType = styled.span`
  color: ${(props) => props.theme.color.muted};
`

const BrowseRecipes = styled(Link)``

const BrowseRecipesContainer = styled.div`
  ${suggestionStyle}
  border-top-style: solid;
  border-top-width: 1px;
  border-color: #f2f2f2;
  margin-top: 0.5rem;
  display: flex;
  justify-content: space-between;
`

const NameAuthorContainer = styled.div`
  display: flex;
`

type Recipe = { readonly id: string; readonly name: string }
type RecipeSchedule = { readonly day: string; readonly recipes: Recipe[] }

function buildSchedule(
  schedule: readonly {
    readonly on: string
    readonly recipe: {
      readonly id: string
      readonly name: string
    }
  }[],
  start: Date,
  end: Date,
): readonly RecipeSchedule[] {
  const newSchedule: {
    [key: string]: { id: string; name: string }[] | undefined
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
    })
  })
  return Object.entries(newSchedule).map(([key, value]): RecipeSchedule => {
    return { day: format(parseISO(key), "E"), recipes: value || [] }
  })
}

function useSchedulePreview() {
  const teamID = useScheduleTeamID()
  const start = startOfToday()
  const end = addDays(start, 6)
  const res = useApi(
    api.getCalendarRecipeListRequestBuilder({
      teamID,
      start,
      end,
    }),
  )
  return mapSuccessLike(res, (x) =>
    buildSchedule(
      x.scheduledRecipes.map((scheduledRecipe) => ({
        on: scheduledRecipe.on,
        recipe: {
          id: scheduledRecipe.recipe.id.toString(),
          name: scheduledRecipe.recipe.name,
        },
      })),
      start,
      end,
    ),
  )
}

function SchedulePreview() {
  const scheduledRecipes = useSchedulePreview()

  return (
    <ScheduleContainer>
      <SectionTitle>Schedule</SectionTitle>
      <div>
        {isSuccess(scheduledRecipes) ? (
          scheduledRecipes.data.map((x) => (
            <ScheduledRecipe key={x.day} day={x.day} recipes={x.recipes} />
          ))
        ) : isFailure(scheduledRecipes) ? (
          <p>Failed to Load Schedule</p>
        ) : (
          <p>Loading schedule...</p>
        )}
      </div>
    </ScheduleContainer>
  )
}
const UserHome = () => {
  const [searchQuery, setSearchQuery] = React.useState("")
  const recipes = useSelector((s) => getTeamRecipes(s, "personal"))
  const dispatch = useDispatch()
  useEffect(() => {
    void fetchingRecipeListAsync(dispatch)()
  }, [dispatch])
  const setQuery = React.useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      setSearchQuery(event.target.value)
    },
    [],
  )

  const filteredRecipes =
    recipes?.kind === "Success"
      ? searchRecipes({ recipes: recipes.data, query: searchQuery })
      : { recipes: [] }

  const loadingSuggestions = recipes?.kind !== "Success"

  const suggestions = filteredRecipes.recipes
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
          to={`/recipes/${recipe.id}`}
          firstItem={index === 0}
        >
          <NameAuthorContainer>
            <RecipeName bold={nameMatch != null}>{recipe.name} </RecipeName>
            {recipe.author && (
              <SuggestionAuthorContainer>
                by{" "}
                <SuggestionAuthor bold={authorMatch != null}>
                  {recipe.author}
                </SuggestionAuthor>
              </SuggestionAuthorContainer>
            )}
          </NameAuthorContainer>
          {ingredientMatch != null ? (
            <RecipeMatchPiece>{ingredientMatch.value}</RecipeMatchPiece>
          ) : null}
          {tagMatch != null ? (
            <span className="tag">{tagMatch.value}</span>
          ) : null}
        </SuggestionItem>
      )
    })
    .slice(0, 7)

  const handleSearchKeydown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    const key = e.key
    const suggestion = filteredRecipes.recipes[0]
    if (!suggestion) {
      return
    }
    if (key === "Enter") {
      dispatch(push(`/recipes/${suggestion.recipe.id}`))
    }
  }

  return (
    <>
      <div className="container pr-2 pl-2 pb-2">
        <Helmet title="Home" />
        <SearchInputAligner>
          <SearchInputContainer>
            <SearchInput
              autoFocus
              value={searchQuery}
              onChange={setQuery}
              onKeyDown={handleSearchKeydown}
              placeholder="Search your recipes..."
            />
            {searchQuery && (
              <SuggestionBox>
                {!loadingSuggestions ? (
                  <>
                    {suggestions.length === 0 && (
                      <SuggestionInfo>No Results Found</SuggestionInfo>
                    )}
                    {suggestions}
                    <BrowseRecipesContainer>
                      <MatchType>
                        matches: {filteredRecipes.recipes.length}
                      </MatchType>

                      <BrowseRecipes
                        to={{
                          pathname: "/recipes",
                          search: `search=${encodeURIComponent(searchQuery)}`,
                        }}
                      >
                        Browse
                      </BrowseRecipes>
                    </BrowseRecipesContainer>
                  </>
                ) : (
                  <SuggestionInfo>Loading...</SuggestionInfo>
                )}
              </SuggestionBox>
            )}
            <SearchOptions>
              fields <Code>author:Jane Doe</Code>,{" "}
              <Code>ingredient:onions</Code>, <Code>name:cake</Code>
            </SearchOptions>
          </SearchInputContainer>
        </SearchInputAligner>
        <div className="home-page-grid">
          <SchedulePreview />
        </div>
      </div>

      <Footer />
    </>
  )
}

export default UserHome
