import React from "react"
import { Helmet } from "@/components/Helmet"
import NoMatch from "@/components/NoMatch"
import Loader from "@/components/Loader"
import AddStep from "@/components/AddStep"
import AddIngredient from "@/components/AddIngredient"
import StepContainer from "@/components/StepContainer"
import { Ingredient } from "@/components/Ingredient"
import RecipeTitle from "@/components/RecipeTitle"
import { RouteComponentProps } from "react-router"
import {
  IRecipe,
  IIngredient,
  getRecipeById,
  fetchRecipe,
  deleteIngredient,
  updateIngredient
} from "@/store/reducers/recipes"
import { isInitial, isLoading, isFailure } from "@/webdata"
import { SectionTitle } from "@/components/RecipeHelpers"
import { styled } from "@/theme"
import { Link } from "react-router-dom"
import queryString from "query-string"
import { RecipeTimeline } from "@/components/RecipeTimeline"
import { useDispatch, useSelector } from "@/hooks"
import { NoteContainer } from "@/components/Notes"

interface IRecipeDetailsProps {
  readonly recipe: IRecipe
}
function RecipeDetails({ recipe }: IRecipeDetailsProps) {
  const [addIngredient, setAddIngredient] = React.useState(false)
  const [addStep, setAddStep] = React.useState(false)
  const dispatch = useDispatch()

  return (
    <section className="ingredients-preparation-grid">
      <div>
        <SectionTitle>Ingredients</SectionTitle>
        <ul>
          {recipe.ingredients.map(ingre => {
            const handleUpdate = (
              ingredient: Omit<IIngredient, "id" | "position">
            ) =>
              dispatch(
                updateIngredient.request({
                  recipeID: recipe.id,
                  ingredientID: ingre.id,
                  content: ingredient
                })
              )

            const handleRemove = () =>
              dispatch(
                deleteIngredient.request({
                  recipeID: recipe.id,
                  ingredientID: ingre.id
                })
              )

            return (
              <Ingredient
                key={ingre.id}
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
              />
            )
          })}
        </ul>
        {addIngredient ? (
          <AddIngredient
            id={recipe.id}
            autoFocus
            loading={!!recipe.addingIngredient}
            onCancel={() => setAddIngredient(false)}
          />
        ) : (
          <a className="text-muted" onClick={() => setAddIngredient(true)}>
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
        <SectionTitle>Notes</SectionTitle>
        <NoteContainer notes={recipe.notes} recipeId={recipe.id} />
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
  React.useEffect(() => {
    dispatch(fetchRecipe.request(recipeId))
  }, [dispatch, recipeId])
  return useSelector(state => getRecipeById(state, recipeId))
}

type IRecipeProps = RouteComponentProps<{ id: string }>

export function Recipe(props: IRecipeProps) {
  const recipeId = parseInt(props.match.params.id, 10)

  const maybeRecipe = useRecipe(recipeId)

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

      <RecipeTitle
        id={recipe.id}
        name={recipe.name}
        author={recipe.author}
        source={recipe.source}
        servings={recipe.servings}
        time={recipe.time}
        owner={recipe.owner}
        updating={recipe.updating}
        deleting={recipe.deleting}
        editing={recipe.editing}
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
