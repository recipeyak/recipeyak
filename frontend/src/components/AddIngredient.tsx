import React from "react"

import AddIngredientForm from "./AddIngredientForm"

export interface IIngredientBasic {
  readonly quantity: string
  readonly name: string
  readonly description: string
}

interface IAddIngredientProps {
  readonly onCancel: () => void
  readonly id: number
  readonly addIngredient: (
    id: number,
    { quantity, name, description }: IIngredientBasic
  ) => Promise<void>
  readonly loading: boolean
  readonly autoFocus: boolean
}

interface IAddIngredientState {
  readonly quantity: string
  readonly name: string
  readonly description: string
  readonly optional: boolean
  readonly addingIngredient: boolean
}

export type AddIngredientFields = Exclude<
  keyof IAddIngredientState,
  "addingIngredient"
>

export default class AddIngredient extends React.Component<
  IAddIngredientProps,
  IAddIngredientState
> {
  static readonly defaultProps = {
    loading: false
  }

  readonly emptyState: IAddIngredientState = {
    quantity: "",
    name: "",
    description: "",
    optional: false,
    addingIngredient: false
  }

  readonly state: IAddIngredientState = this.emptyState

  readonly handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    this.setState(({
      [e.target.name]: e.target.value
    } as unknown) as IAddIngredientState)
  }

  readonly addingIngredient = () => {
    this.setState({ addingIngredient: true })
  }

  readonly cancelAddIngredient = async () => {
    this.props.onCancel()
    this.setState(this.emptyState)
  }

  readonly clearInputs = () => {
    this.setState(this.emptyState)
  }

  render() {
    const { clearInputs, cancelAddIngredient, handleInputChange } = this
    const { id, addIngredient, loading, autoFocus } = this.props
    const { quantity, name, description, optional } = this.state

    return (
      <AddIngredientForm
        handleAddIngredient={async () => {
          await addIngredient(id, { quantity, name, description })
          clearInputs()
        }}
        loading={loading}
        cancelAddIngredient={cancelAddIngredient}
        handleInputChange={handleInputChange}
        quantity={quantity}
        name={name}
        description={description}
        optional={optional}
        autoFocus={autoFocus}
      />
    )
  }
}
