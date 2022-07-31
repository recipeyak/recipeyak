import React from "react"
import { Helmet } from "@/components/Helmet"

import ListItem from "@/components/ListItem"
import AddIngredientForm from "@/components/AddIngredientForm"
import AddStepForm from "@/components/AddStepForm"
import { Ingredient } from "@/components/Ingredient"
import { ButtonPrimary, Button } from "@/components/Buttons"
import {
  IStepBasic,
  IRecipeBasic,
  IIngredientBasic,
  IAddRecipeError,
} from "@/store/reducers/recipes"
import { ITeam } from "@/store/reducers/teams"
import { Select, TextInput } from "@/components/Forms"
import { SectionTitle } from "@/components/RecipeHelpers"

const unfinishedIngredient = ({ quantity = "", name = "" }) =>
  quantity === "" || name === ""

interface IAddRecipeProps {
  readonly clearErrors: () => void
  readonly addStep: (step: IStepBasic) => void
  readonly clearForm: () => void
  readonly setTime: (e: React.ChangeEvent<HTMLInputElement>) => void
  readonly setServings: (e: React.ChangeEvent<HTMLInputElement>) => void
  readonly setSource: (e: React.ChangeEvent<HTMLInputElement>) => void
  readonly setAuthor: (e: React.ChangeEvent<HTMLInputElement>) => void
  readonly setName: (e: React.ChangeEvent<HTMLInputElement>) => void
  readonly removeStep: (index: number) => void
  readonly updateStep: (_recipeID: number, i: number, step: IStepBasic) => void
  readonly fetchData: () => void
  readonly addRecipe: (recipe: IRecipeBasic) => void
  readonly removeIngredient: (index: number) => void
  readonly updateIngredient: (
    index: number,
    ingredient: IIngredientBasic,
  ) => void
  readonly addIngredient: (ingredient: IIngredientBasic) => void
  readonly error: IAddRecipeError
  readonly loading: boolean
  readonly name: string
  readonly author: string
  readonly source: string
  readonly time: string
  readonly servings: string
  readonly ingredients: IIngredientBasic[]
  readonly steps: IStepBasic[]
  readonly loadingTeams: boolean
  readonly teams: ITeam[]
  readonly setTeamID: (x: number | null) => void
  readonly teamID: ITeam["id"] | null
}

interface IAddRecipeState {
  readonly ingredient: {
    readonly quantity: string
    readonly name: string
    readonly description: string
    readonly optional: boolean
    readonly [key: string]: string | boolean | undefined
  }
  readonly step: string
  readonly loading: boolean
}

const emptyIngredient = {
  quantity: "",
  name: "",
  description: "",
  optional: false,
}

export default class AddRecipe extends React.Component<
  IAddRecipeProps,
  IAddRecipeState
> {
  state: IAddRecipeState = {
    ingredient: emptyIngredient,
    step: "",
    loading: false,
  }

  componentDidMount() {
    this.props.clearErrors()
    this.props.fetchData()
  }

  handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    /* eslint-disable @typescript-eslint/consistent-type-assertions */
    this.setState({
      [e.target.name]: e.target.value,
    } as unknown as IAddRecipeState)
    /* eslint-enable @typescript-eslint/consistent-type-assertions */
  }

  handleSubmit = (event: React.FormEvent) => {
    event.preventDefault()
    // If we have an unsaved step, save it anyway.
    const steps = this.state.step.trim()
      ? [...this.props.steps, { text: this.state.step }]
      : this.props.steps
    // Save non-empty, unsaved ingredients.
    const ingredients =
      this.state.ingredient.name && this.state.ingredient.quantity
        ? [...this.props.ingredients, this.state.ingredient]
        : this.props.ingredients
    this.props.addRecipe({
      name: this.props.name,
      author: this.props.author,
      source: this.props.source,
      time: this.props.time,
      servings: this.props.servings,
      ingredients,
      steps,
      timelineItems: [],
      sections: [],
      team: this.props.teamID || undefined,
    })
  }

  addIngredient = () => {
    if (unfinishedIngredient(this.state.ingredient)) {
      return
    }
    this.setState({ loading: true })
    this.props.addIngredient(this.state.ingredient)
    this.setState({ ingredient: emptyIngredient, loading: false })
  }

  handleIngredientChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    e.persist()
    if (e.target.type === "checkbox") {
      this.setState((prev) => ({
        ingredient: {
          ...prev.ingredient,
          [e.target.name]: !prev.ingredient[e.target.name],
        },
      }))
      return
    }
    this.setState((prevState) => ({
      ingredient: {
        ...prevState.ingredient,
        [e.target.name]: e.target.value,
      },
    }))
  }

  cancelAddIngredient = () => this.setState({ ingredient: emptyIngredient })

  addStep = () => {
    this.props.addStep({ text: this.state.step })
    this.setState({ step: "" })
  }

  cancelAddStep = () => this.setState({ step: "" })

  handleTeamChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    if (e.target.value === "personal") {
      return this.props.setTeamID(null)
    }
    const id = parseInt(e.target.value, 10)
    this.props.setTeamID(id)
  }

  render() {
    const { ingredient, step } = this.state

    const {
      addStep,
      handleInputChange,
      cancelAddStep,
      handleSubmit,
      addIngredient,
      cancelAddIngredient,
      handleIngredientChange,
    } = this

    const { errorWithName } = this.props.error

    const {
      quantity = "",
      name = "",
      description = "",
      optional = false,
    } = ingredient

    return (
      <div className="d-grid grid-gap-1rem">
        <Helmet title="Add Recipe" />
        <div>
          <TextInput
            autoFocus
            onChange={this.props.setName}
            value={this.props.name}
            error={errorWithName}
            className="fs-2rem"
            placeholder="new recipe title"
            name="name"
          />
          {errorWithName ? (
            <p className="fs-4 c-danger">A recipe needs a name</p>
          ) : null}
        </div>

        <div className="d-grid  meta-data-grid">
          <label className="d-flex align-center">
            By
            <TextInput
              onChange={this.props.setAuthor}
              value={this.props.author}
              className="ml-2"
              placeholder="Author"
              name="author"
            />
          </label>
          <label className="d-flex align-center">
            from
            <TextInput
              onChange={this.props.setSource}
              value={this.props.source}
              className="ml-2"
              placeholder="http://example.com/dumpling-soup"
              name="source"
            />
          </label>
          <label className="d-flex align-center">
            creating
            <TextInput
              onChange={this.props.setServings}
              value={this.props.servings}
              className="ml-2"
              placeholder="4 to 6 servings"
              name="servings"
            />
          </label>
          <label className="d-flex align-center">
            in
            <TextInput
              onChange={this.props.setTime}
              value={this.props.time}
              className="ml-2"
              placeholder="1 hour"
              name="time"
            />
          </label>
        </div>

        <section className="ingredients-preparation-grid">
          <div>
            {/* TODO(chdsbd): Remove duplicated code. Replace with Recipe.tsx components. */}
            <SectionTitle>Ingredients</SectionTitle>
            <ul>
              {this.props.ingredients.map((x, i) => (
                <Ingredient
                  key={x.name + String(i)}
                  recipeID={-1}
                  index={i}
                  id={i}
                  update={(ingre: IIngredientBasic) =>
                    this.props.updateIngredient(i, ingre)
                  }
                  remove={() => this.props.removeIngredient(i)}
                  quantity={x.quantity}
                  optional={x.optional}
                  name={x.name}
                  description={x.description}
                />
              ))}
            </ul>

            <AddIngredientForm
              toggleShowAddSection={undefined}
              handleAddIngredient={addIngredient}
              cancelAddIngredient={cancelAddIngredient}
              handleInputChange={handleIngredientChange}
              quantity={quantity}
              name={name}
              description={description}
              optional={optional}
              loading={this.state.loading}
            />
          </div>

          <div>
            <SectionTitle>Preparation</SectionTitle>
            <ul>
              {this.props.steps.map((s, i) => (
                <div key={s.text + String(i)}>
                  <label className="better-label">Step {i + 1}</label>
                  <ListItem
                    id={i}
                    text={s.text}
                    update={this.props.updateStep}
                    delete={this.props.removeStep}
                  />
                </div>
              ))}
            </ul>
            <AddStepForm
              handleInputChange={handleInputChange}
              addStep={addStep}
              cancelAddStep={cancelAddStep}
              stepNumber={this.props.steps.length + 1}
              text={step}
            />
          </div>
        </section>
        <div className="d-flex justify-space-between align-items-center">
          <Button type="reset" onClick={this.props.clearForm} name="clear form">
            Clear
          </Button>

          <div className="d-flex justify-space-between">
            <label className="d-flex align-center">
              for
              <Select
                size="small"
                className="ml-2"
                disabled={this.props.loadingTeams}
                value={this.props.teamID || "personal"}
                onChange={this.handleTeamChange}
              >
                <option value="personal">Personal</option>
                {this.props.teams.map((t) => (
                  <option key={t.id} value={t.id}>
                    Team: {t.name}
                  </option>
                ))}
              </Select>
            </label>
            <ButtonPrimary
              className="ml-2"
              type="submit"
              onClick={handleSubmit}
              name="create recipe"
              loading={this.props.loading}
            >
              Create Recipe
            </ButtonPrimary>
          </div>
        </div>
      </div>
    )
  }
}
