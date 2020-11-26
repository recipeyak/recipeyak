import React, { useEffect } from "react"
import { Helmet } from "@/components/Helmet"
import { Link } from "react-router-dom"
import Footer from "@/components/Footer"
import { TextInput } from "@/components/Forms"
import { css, styled } from "@/theme"
import { useDispatch, useSelector } from "@/hooks"
import { push } from "connected-react-router"
import { fetchingRecipeListAsync } from "@/store/thunks"
import { getTeamRecipes } from "@/store/reducers/recipes"
import { searchRecipes } from "@/search"

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

const SuggestionItem = styled(Link)`
  ${suggestionStyle}
`

const BrowseRecipes = styled(Link)`
  ${suggestionStyle}
  border-top-style: solid;
  border-top-width: 1px;
  border-color: #f2f2f2;
  margin-top: 0.5rem;
  text-align: center;
`

const UserHome = () => {
  const [searchQuery, setSearchQuery] = React.useState("")
  const recipes = useSelector(s => getTeamRecipes(s, "personal"))
  const dispatch = useDispatch()
  useEffect(() => {
    fetchingRecipeListAsync(dispatch)("personal")
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
      : []

  const loadingSuggestions = recipes?.kind !== "Success"

  const suggestions = filteredRecipes
    .map(recipe => {
      return (
        <SuggestionItem key={recipe.id} to={`/recipes/${recipe.id}`}>
          <b>{recipe.name}</b> by {recipe.author}
        </SuggestionItem>
      )
    })
    .slice(0, 7)

  const handleSearchKeydown = React.useCallback(
    (e: React.KeyboardEvent<HTMLInputElement>) => {
      const key = e.key
      const suggestion = filteredRecipes[0]
      if (!suggestion) {
        return
      }
      if (key === "Enter") {
        dispatch(push(`/recipes/${suggestion.id}`))
      }
    },
    [dispatch, filteredRecipes],
  )

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
                      <p className="text-muted text-center">
                        No Results Found.
                      </p>
                    )}
                    {suggestions.map(x => x)}
                    <BrowseRecipes
                      to={{
                        pathname: "/recipes",
                        search: `search=${searchQuery}`,
                      }}>
                      Browse Recipes
                    </BrowseRecipes>
                  </>
                ) : (
                  <p className="text-center">Loading...</p>
                )}
              </SuggestionBox>
            )}
            <SearchOptions className="text-muted">
              fields <Code>author:Jane Doe</Code>,{" "}
              <Code>ingredient:onions</Code>, <Code>name:cake</Code>
            </SearchOptions>
          </SearchInputContainer>
        </SearchInputAligner>
      </div>

      <Footer />
    </>
  )
}

export default UserHome
