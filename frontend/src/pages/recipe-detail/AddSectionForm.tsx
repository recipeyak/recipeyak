import React from "react"

import * as api from "@/api"
import { Button, ButtonPrimary } from "@/components/Buttons"
import { TextInput } from "@/components/Forms"
import GlobalEvent from "@/components/GlobalEvent"
import { useDispatch } from "@/hooks"
import { isOk } from "@/result"
import { addSectionToRecipe } from "@/store/reducers/recipes"
import type { Status } from "@/webdata"

export function AddSectionFormInner({
  onSave,
  onCancel,
  onRemove,
  status,
  value,
  removing,
  onChange,
  toggleShowAddSection,
}: {
  readonly onSave: () => void
  readonly onCancel: () => void
  readonly onRemove: (() => void) | null
  readonly onChange: (e: React.ChangeEvent<HTMLInputElement>) => void
  readonly value: string
  readonly status: Status
  readonly removing: Status | null
  readonly toggleShowAddSection: (() => void) | null
}) {
  function handleKeyUp(e: KeyboardEvent) {
    if (e.key === "Escape") {
      onCancel()
    }
  }
  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    onSave()
  }
  const addDisabled = value === ""
  return (
    <form onSubmit={handleSubmit}>
      <GlobalEvent keyUp={handleKeyUp} />
      <div className="mb-2 mt-2">
        <TextInput
          onChange={onChange}
          autoFocus
          value={value}
          placeholder="for the sauce"
          name="section title"
        />
      </div>
      <div className="field is-grouped">
        {onRemove ? (
          <p className="control flex-grow">
            <Button
              size="small"
              type="button"
              onClick={onRemove}
              loading={removing === "loading"}
            >
              Remove
            </Button>
          </p>
        ) : toggleShowAddSection ? (
          <p className="control flex-grow">
            <Button
              size="small"
              type="button"
              name="toggle add section"
              onClick={toggleShowAddSection}
            >
              Add Ingredient
            </Button>
          </p>
        ) : null}
        <p className="control">
          <Button
            onClick={onCancel}
            size="small"
            type="button"
            name="cancel add ingredient"
          >
            Cancel
          </Button>
        </p>
        <p className="control">
          <ButtonPrimary
            disabled={addDisabled}
            size="small"
            type="submit"
            loading={status === "loading"}
          >
            Save
          </ButtonPrimary>
        </p>
      </div>
      {status === "failure" && <p>error adding ingredient</p>}
    </form>
  )
}

type StateType = {
  readonly sectionTitle: string
  readonly status: Status
}

export function AddSectionForm({
  toggleShowAddSection,
  onCancel,
  recipeId,
}: {
  readonly toggleShowAddSection: () => void
  readonly onCancel: () => void
  readonly recipeId: number
}) {
  const dispatch = useDispatch()
  const [state, setState] = React.useState<StateType>({
    sectionTitle: "",
    status: "initial",
  })
  function handleInputChange(e: React.ChangeEvent<HTMLInputElement>) {
    const sectionTitle = e.target.value
    setState((prev) => ({ ...prev, sectionTitle }))
  }
  function onSave() {
    setState((prev) => ({ ...prev, status: "loading" }))
    void api
      .addSectionToRecipe({ recipeId, section: state.sectionTitle })
      .then((res) => {
        if (isOk(res)) {
          dispatch(
            addSectionToRecipe({
              recipeId,
              section: res.data,
            }),
          )
          setState((prev) => ({ ...prev, status: "success", sectionTitle: "" }))
        } else {
          setState((prev) => ({ ...prev, status: "failure" }))
        }
      })
  }
  return (
    <AddSectionFormInner
      onSave={onSave}
      onChange={handleInputChange}
      value={state.sectionTitle}
      toggleShowAddSection={toggleShowAddSection}
      onCancel={onCancel}
      status={state.status}
      onRemove={null}
      removing={null}
    />
  )
}
