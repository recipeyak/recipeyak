import React from "react"
import { Helmet } from "@/components/Helmet"
import NoMatch from "@/components/NoMatch"
import Loader from "@/components/Loader"
import AddStep from "@/components/AddStep"
import AddIngredientOrSection from "@/components/AddIngredient"
import StepContainer from "@/components/StepContainer"
import { Ingredient } from "@/components/Ingredient"
import RecipeTitle from "@/components/RecipeTitle"
import { RouteComponentProps } from "react-router"
import { useLocation, Link } from "react-router-dom"
import { recipeURL } from "@/urls"
import { pathNamesEqual } from "@/utils/url"
import { replace } from "connected-react-router"

import {
  IRecipe,
  getRecipeById,
  fetchRecipe,
  deleteIngredient,
  updateIngredient,
  IIngredient,
  updateSectionForRecipe,
} from "@/store/reducers/recipes"
import { isInitial, isLoading, isFailure, isSuccessLike } from "@/webdata"
import { SectionTitle } from "@/components/RecipeHelpers"
import { styled } from "@/theme"

import queryString from "query-string"
import { RecipeTimeline } from "@/components/RecipeTimeline"
import { useDispatch, useSelector, useOnWindowFocusChange } from "@/hooks"
import { NoteContainer } from "@/components/Notes"
import { getNewPosIngredients } from "@/position"
import sortBy from "lodash/sortBy"
import { Section } from "@/components/Section"
import * as api from "@/api"
import { isOk } from "@/result"

type SectionsAndIngredients = ReadonlyArray<
  | {
      readonly kind: "ingredient"
      readonly item: IIngredient
    }
  | {
      readonly kind: "section"
      readonly item: {
        readonly id: number
        readonly title: string
        readonly position: number
      }
    }
>

function getInitialIngredients({
  sections,
  ingredients,
}: Pick<IRecipe, "sections" | "ingredients">): SectionsAndIngredients {
  const out: Mutable<SectionsAndIngredients> = []
  for (const s of sections) {
    out.push({
      kind: "section" as const,
      item: s,
    })
  }
  for (const i of ingredients) {
    out.push({
      kind: "ingredient" as const,
      item: i,
    })
  }
  return sortBy(out, x => x.item.position)
}

function RecipeDetails({ recipe }: { readonly recipe: IRecipe }) {
  const [addIngredient, setAddIngredient] = React.useState(false)
  const [addStep, setAddStep] = React.useState(false)
  const dispatch = useDispatch()
  const [sectionsAndIngredients, setSectionsAndIngredients] = React.useState<
    SectionsAndIngredients
  >(() => getInitialIngredients(recipe))
  React.useEffect(() => {
    setSectionsAndIngredients(
      getInitialIngredients({
        sections: recipe.sections,
        ingredients: recipe.ingredients,
      }),
    )
  }, [recipe.ingredients, recipe.sections])

  const handleMove = ({
    from,
    to,
  }: {
    readonly from: number
    readonly to: number
  }) => {
    setSectionsAndIngredients(prev => {
      const newIngredients = [...prev]
      const item = newIngredients[from]
      newIngredients.splice(from, 1)
      newIngredients.splice(to, 0, item)
      return newIngredients
    })
  }

  const handleCompleteMove = (args: {
    readonly kind: "section" | "ingredient"
    readonly id: number
    readonly to: number
  }) => {
    const newPosition = getNewPosIngredients(sectionsAndIngredients, args.to)
    if (newPosition == null) {
      return
    }
    setSectionsAndIngredients(prev => {
      const out: Mutable<SectionsAndIngredients> = []
      for (const item of prev) {
        if (item.item.id === args.id) {
          // NOTE(sbdchd): we do this weird `if` to make typescript happy
          if (item.kind === "ingredient") {
            out.push({
              ...item,
              item: {
                ...item.item,
                position: newPosition,
              },
            })
          } else {
            out.push({
              ...item,
              item: {
                ...item.item,
                position: newPosition,
              },
            })
          }
        } else {
          out.push(item)
        }
      }
      return out
    })
    if (args.kind === "ingredient") {
      dispatch(
        updateIngredient.request({
          recipeID: recipe.id,
          ingredientID: args.id,
          content: { position: newPosition },
        }),
      )
    } else {
      api
        .updateSection({ sectionId: args.id, position: newPosition })
        .then(res => {
          if (isOk(res)) {
            dispatch(
              updateSectionForRecipe({
                recipeId: recipe.id,
                sectionId: args.id,
                position: newPosition,
              }),
            )
          }
        })
    }
  }

  const handleHideAddIngredient = () => setAddIngredient(false)
  const handleShowAddIngredient = () => setAddIngredient(true)

  const handleRemove = ({ ingredientId }: { readonly ingredientId: number }) =>
    dispatch(
      deleteIngredient.request({
        recipeID: recipe.id,
        ingredientID: ingredientId,
      }),
    )

  const handleUpdate = ({
    ingredientId,
    ...ingredient
  }: {
    readonly ingredientId: number
    readonly quantity: string
    readonly name: string
    readonly description: string
    readonly optional: boolean
  }) =>
    dispatch(
      updateIngredient.request({
        recipeID: recipe.id,
        ingredientID: ingredientId,
        content: ingredient,
      }),
    )

  return (
    <section className="ingredients-preparation-grid">
      <div>
        <SectionTitle>Ingredients</SectionTitle>
        <ul>
          {sectionsAndIngredients.map((item, i) => {
            if (item.kind === "ingredient") {
              const ingre = item.item
              return (
                <Ingredient
                  key={"ingredient" + ingre.id}
                  index={i}
                  recipeID={recipe.id}
                  id={ingre.id}
                  quantity={ingre.quantity}
                  name={ingre.name}
                  update={handleUpdate}
                  remove={handleRemove}
                  updating={ingre.updating}
                  removing={ingre.removing}
                  description={ingre.description}
                  optional={ingre.optional}
                  completeMove={handleCompleteMove}
                  move={handleMove}
                />
              )
            }
            if (item.kind === "section") {
              const sec = item.item
              return (
                <Section
                  key={"section" + sec.id}
                  recipeId={recipe.id}
                  sectionId={sec.id}
                  title={sec.title}
                  index={i}
                  move={handleMove}
                  completeMove={handleCompleteMove}
                />
              )
            }
          })}
        </ul>
        {addIngredient ? (
          <AddIngredientOrSection
            recipeId={recipe.id}
            autoFocus
            addingIngredient={!!recipe.addingIngredient}
            onCancel={handleHideAddIngredient}
          />
        ) : (
          <a className="text-muted" onClick={handleShowAddIngredient}>
            add
          </a>
        )}
      </div>

      <div>
        <SectionTitle>Preparation</SectionTitle>
        <StepContainer steps={recipe.steps} recipeID={recipe.id} />
        {addStep ? (
          <AddStep
            id={recipe.id}
            index={recipe.steps.length + 1}
            step={recipe.draftStep}
            autoFocus
            onCancel={() => setAddStep(false)}
            loading={recipe.addingStepToRecipe}
          />
        ) : (
          <a className="text-muted" onClick={() => setAddStep(true)}>
            add
          </a>
        )}
      </div>
      {/* extra div to push notes to the right side of the grid */}
      <div />
      <div>
        <NoteContainer
          timelineItems={recipe.timelineItems}
          recipeId={recipe.id}
        />
      </div>
    </section>
  )
}

const Nav = styled.div``

interface INavItemProps {
  readonly isActive: boolean
}

const NavItem = styled(Link)<INavItemProps>`
  font-weight: bold;
  margin-right: 0.5rem;
  ${props => props.isActive && "border-bottom: 2px solid;"}
  &:hover {
    border-bottom: 2px solid;
    text-decoration: none;
  }
`

export function useRecipe(recipeId: number) {
  const dispatch = useDispatch()
  const fetch = React.useCallback(() => {
    dispatch(fetchRecipe.request(recipeId))
  }, [dispatch, recipeId])
  React.useEffect(() => {
    fetch()
  }, [fetch])
  useOnWindowFocusChange(fetch)
  return useSelector(state => getRecipeById(state, recipeId))
}

const ArchiveMessage = styled.div`
  background: whitesmoke;
  font-weight: bold;
  padding-left: 0.5rem;
  padding-right: 0.5rem;
  border-radius: 5px;
  margin-left: 0.5rem;
  margin-right: 0.5rem;
`

function ArchiveBanner({ date }: { readonly date: Date }) {
  const formattedDate = date.toLocaleDateString()
  return (
    <div className="d-flex align-items-center">
      <hr className="flex-grow mb-0 mt-0" />
      <ArchiveMessage>Recipe Archived on {formattedDate}</ArchiveMessage>
      <hr className="flex-grow mb-0 mt-0" />
    </div>
  )
}

/** On load, update the recipe URL to include the slugified recipe name */
function useRecipeUrlUpdate(recipe: { id: number; name: string } | null) {
  const dispatch = useDispatch()
  const location = useLocation()

  const { id: recipeId, name: recipeName } = recipe || {}

  React.useEffect(() => {
    if (recipeId == null || recipeName == null) {
      return
    }
    const pathname = recipeURL(recipeId, recipeName)
    if (pathNamesEqual(location.pathname, pathname)) {
      return
    }
    dispatch(replace({ pathname }))
  }, [dispatch, location, recipeId, recipeName])
}

type IRecipeProps = RouteComponentProps<{ id: string }>

export function Recipe(props: IRecipeProps) {
  const recipeId = parseInt(props.match.params.id, 10)

  const maybeRecipe = useRecipe(recipeId)

  useRecipeUrlUpdate(
    isSuccessLike(maybeRecipe)
      ? { id: maybeRecipe.data.id, name: maybeRecipe.data.name }
      : null,
  )

  if (isInitial(maybeRecipe) || isLoading(maybeRecipe)) {
    return (
      <section className="d-flex justify-content-center">
        <Loader />
      </section>
    )
  }

  if (isFailure(maybeRecipe)) {
    return <NoMatch />
  }

  const recipe = maybeRecipe.data

  const parsed = queryString.parse(props.location.search)

  const isTimeline = !!parsed.timeline

  return (
    <div className="d-grid grid-gap-2">
      <Helmet title={recipe.name} />
      {recipe.archived_at != null && (
        <ArchiveBanner date={new Date(recipe.archived_at)} />
      )}

      <RecipeTitle
        id={recipe.id}
        name={recipe.name}
        author={recipe.author}
        source={recipe.source}
        servings={recipe.servings}
        time={recipe.time}
        owner={recipe.owner}
        updating={recipe.updating}
        editing={recipe.editing}
        tags={recipe.tags}
      />

      <Nav>
        <NavItem isActive={!isTimeline} to={props.location.pathname}>
          Detail
        </NavItem>
        <NavItem
          isActive={isTimeline}
          to={props.location.pathname + "?timeline=1"}>
          Timeline
        </NavItem>
      </Nav>

      {isTimeline ? (
        <RecipeTimeline recipeId={recipe.id} createdAt={recipe.created} />
      ) : (
        <RecipeDetails recipe={recipe} />
      )}
    </div>
  )
}

export default Recipe
