import React, { useState } from "react"

import { Button } from "@/components/Buttons"
import { TextInput } from "@/components/Forms"
import { useSectionCreate } from "@/queries/sectionCreate"

export function AddSectionForm({
  toggleShowAddSection,
  onCancel,
  recipeId,
  newPosition,
}: {
  readonly toggleShowAddSection: () => void
  readonly onCancel: () => void
  readonly recipeId: number
  readonly newPosition: string
}) {
  const [section, setSection] = useState("")
  const createSection = useSectionCreate()
  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    createSection.mutate(
      {
        recipeId,
        payload: {
          title: section,
          position: newPosition,
        },
      },
      {
        onSuccess: () => {
          setSection("")
        },
      },
    )
  }
  const addDisabled = section === ""
  return (
    <form onSubmit={handleSubmit}>
      <div className="mb-2 mt-2">
        <TextInput
          onChange={(e) => {
            setSection(e.target.value)
          }}
          autoFocus
          value={section}
          placeholder="for the sauce"
          name="section title"
        />
      </div>
      <div className="field is-grouped">
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
          <Button
            variant="primary"
            disabled={addDisabled}
            size="small"
            type="submit"
            loading={createSection.isLoading}
          >
            Save
          </Button>
        </p>
      </div>
      {createSection.isError && <p>error adding ingredient</p>}
    </form>
  )
}
