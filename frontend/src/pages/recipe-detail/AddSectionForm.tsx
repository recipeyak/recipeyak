import React, { useState } from "react"

import { Button } from "@/components/Buttons"
import { FormControl } from "@/components/FormControl"
import { FormField } from "@/components/FormField"
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
      <div className="my-2">
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
      <FormField isGrouped>
        <FormControl className="grow">
          <Button
            size="small"
            type="button"
            name="toggle add section"
            onClick={toggleShowAddSection}
          >
            Add Ingredient
          </Button>
        </FormControl>
        <FormControl>
          <Button
            onClick={onCancel}
            size="small"
            type="button"
            name="cancel add ingredient"
          >
            Cancel
          </Button>
        </FormControl>
        <FormControl>
          <Button
            variant="primary"
            disabled={addDisabled}
            size="small"
            type="submit"
            loading={createSection.isPending}
          >
            Save
          </Button>
        </FormControl>
      </FormField>
      {createSection.isError && <p>error adding ingredient</p>}
    </form>
  )
}
