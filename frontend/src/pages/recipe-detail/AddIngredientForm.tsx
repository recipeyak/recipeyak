import React, { useEffect } from "react"

import { Button } from "@/components/Buttons"
import { CheckBox, selectTarget, TextInput } from "@/components/Forms"
import GlobalEvent from "@/components/GlobalEvent"

function focusFirstInput() {
  const el = document.getElementById("firstinput")
  if (el) {
    el.focus()
  }
}

function IngredientForm({
  handleInputChange,
  quantity,
  autoFocus,
  error,
  optional,
  description,
  name,
}: {
  readonly handleInputChange: (e: React.ChangeEvent<HTMLInputElement>) => void
  readonly quantity: string
  readonly name: string
  readonly description: string
  readonly optional: boolean
  readonly error: boolean | undefined
  readonly autoFocus?: boolean
}) {
  return (
    <>
      <div className="add-ingredient-grid mb-2 mt-2">
        <div>
          <TextInput
            id="firstinput"
            onChange={handleInputChange}
            onFocus={selectTarget}
            autoFocus={autoFocus}
            value={quantity}
            error={error}
            placeholder="3 lbs"
            name="quantity"
          />
        </div>

        <div>
          <TextInput
            onChange={handleInputChange}
            onFocus={selectTarget}
            value={name}
            error={error}
            placeholder="tomato"
            name="name"
          />
        </div>

        <div className="grid-entire-row">
          <TextInput
            onChange={handleInputChange}
            onFocus={selectTarget}
            value={description}
            error={error}
            placeholder="diced at 3cm"
            name="description"
          />
          {error ? (
            <p className="fs-4 c-danger">
              A recipe needs at least one ingredient
            </p>
          ) : null}
        </div>
      </div>

      <label className="d-flex align-items-center cursor-pointer mb-2">
        <CheckBox
          onChange={handleInputChange}
          checked={optional}
          name="optional"
          className="mr-2"
        />
        Optional
      </label>
    </>
  )
}

function AddIngredientForm({
  handleAddIngredient: addIngredient,
  cancelAddIngredient,
  handleInputChange,
  toggleShowAddSection,
  quantity,
  name,
  description,
  optional,
  loading,
  error,
  autoFocus = false,
}: {
  readonly handleAddIngredient: () => void
  readonly cancelAddIngredient: () => void
  readonly handleInputChange: (e: React.ChangeEvent<HTMLInputElement>) => void
  readonly quantity: string
  readonly name: string
  readonly description: string
  readonly optional: boolean
  readonly loading: boolean
  readonly error?: boolean
  readonly autoFocus?: boolean
  readonly toggleShowAddSection: (() => void) | undefined
}) {
  useEffect(() => {
    if (!loading && autoFocus) {
      focusFirstInput()
    }
  }, [autoFocus, loading])

  const handleKeyUp = (e: KeyboardEvent) => {
    if (e.key === "Escape") {
      cancelAddIngredient()
    }
  }
  const handleAddIngredient = () => {
    addIngredient()
    focusFirstInput()
  }
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    handleAddIngredient()
  }

  const addDisabled = quantity === "" && name === ""

  return (
    <form onSubmit={handleSubmit}>
      <GlobalEvent keyUp={handleKeyUp} />
      <IngredientForm
        quantity={quantity}
        name={name}
        description={description}
        optional={optional}
        handleInputChange={handleInputChange}
        error={error}
      />
      <div className="field is-grouped">
        {toggleShowAddSection ? (
          <div className="flex-grow">
            <Button
              size="small"
              type="button"
              name="toggle add section"
              onClick={toggleShowAddSection}
            >
              Add Section
            </Button>
          </div>
        ) : null}
        <p className="control">
          <Button
            onClick={cancelAddIngredient}
            size="small"
            type="button"
            name="cancel add ingredient"
          >
            Cancel
          </Button>
        </p>
        <p className="control">
          <Button
            color="primary"
            disabled={addDisabled}
            size="small"
            type="submit"
            name="add item"
            loading={loading}
          >
            Add
          </Button>
        </p>
      </div>
    </form>
  )
}

export default AddIngredientForm
