import React, { useEffect, useState } from "react"

import { ButtonPrimary, Button } from "@/components/Buttons"
import { TextInput, CheckBox, selectTarget } from "@/components/Forms"
import GlobalEvent from "@/components/GlobalEvent"

interface IAddIngredientFormProps {
  readonly handleAddIngredient: () => void
  readonly cancelAddIngredient: () => void
  readonly handleInputChange: (e: React.ChangeEvent<HTMLInputElement>) => void
  readonly quantity: string
  readonly name: string
  readonly description: string
  readonly optional: boolean
  readonly loading: boolean
  readonly error?: boolean // TODO(sbdchd): this isn't passed in
  readonly autoFocus?: boolean
}

function AddIngredientForm({
  handleAddIngredient,
  cancelAddIngredient,
  handleInputChange,
  quantity,
  name,
  description,
  optional,
  loading,
  error,
  autoFocus = false
}: IAddIngredientFormProps) {
  const [isInitialLoad, setInitialLoad] = useState(true)

  useEffect(
    () => {
      setInitialLoad(false)
      if (!loading && (autoFocus || !isInitialLoad)) {
        const el = document.getElementById("firstinput")
        if (el) {
          el.focus()
        }
      }
    },
    [loading]
  )
  const handleKeyUp = (e: KeyboardEvent) => {
    if (e.key === "Escape") {
      cancelAddIngredient()
    }
  }

  return (
    <form
      onSubmit={e => {
        e.preventDefault()
        handleAddIngredient()
      }}>
      <GlobalEvent keyUp={handleKeyUp} />
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

      <div className="field is-grouped">
        <p className="control">
          <ButtonPrimary
            disabled={quantity === "" && name === ""}
            size="small"
            type="submit"
            name="add ingredient"
            loading={loading}>
            Add
          </ButtonPrimary>
        </p>
        <p className="control">
          <Button
            onClick={cancelAddIngredient}
            size="small"
            type="button"
            name="cancel add ingredient">
            Cancel
          </Button>
        </p>
      </div>
    </form>
  )
}

export default AddIngredientForm
