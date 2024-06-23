import React, { useState } from "react"

import { Button } from "@/components/Buttons"
import { TextInput } from "@/components/TextInput"
import { useSectionCreate } from "@/queries/useSectionCreate"

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
          autoCapitalize="none"
          onChange={(e) => {
            setSection(e.target.value)
          }}
          autoFocus
          value={section}
          placeholder="for the sauce"
          name="section title"
        />
      </div>
      <div className="flex justify-between">
        <Button size="small" type="button" onClick={toggleShowAddSection}>
          Switch to Ingredient
        </Button>
        <div className="flex gap-2">
          <Button onClick={onCancel} size="small" type="button">
            Cancel
          </Button>
          <Button
            variant="primary"
            disabled={addDisabled}
            size="small"
            type="submit"
            loading={createSection.isPending}
          >
            Add Section
          </Button>
        </div>
      </div>
      {createSection.isError && <div>error adding ingredient</div>}
    </form>
  )
}
