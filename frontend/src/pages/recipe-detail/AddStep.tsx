import { useState } from "react"
import Textarea from "react-textarea-autosize"

import { Button } from "@/components/Buttons"
import { FormControl } from "@/components/FormControl"
import { FormField } from "@/components/FormField"
import { BetterLabel } from "@/components/Label"
import { useStepCreate } from "@/queries/stepCreate"

interface IAddStepProps {
  readonly recipeId: number
  readonly index: number
  readonly position: string
  readonly onCancel: () => void
}

function AddStep({ recipeId, onCancel, index, position }: IAddStepProps) {
  const [step, setStep] = useState("")
  const addStep = useStepCreate()
  const addStepToRecipe = () => {
    addStep.mutate(
      {
        recipeId,
        step,
        position,
      },
      {
        onSuccess: () => {
          setStep("")
        },
      },
    )
  }

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault()
        if (step === "") {
          return
        }
        addStepToRecipe()
      }}
    >
      <FormField>
        <BetterLabel>Step {index}</BetterLabel>
        <FormControl className="mt-2">
          <Textarea
            onChange={(e) => {
              setStep(e.target.value)
            }}
            onKeyPress={(e) => {
              if (step === "") {
                return
              }
              if (e.metaKey && e.key === "Enter") {
                e.preventDefault()
                addStepToRecipe()
              }
            }}
            value={step}
            className={"my-textarea" + (addStep.error ? " is-danger" : "")}
            placeholder="Add a step..."
            name="step"
          />
          {addStep.error ? (
            <p className="fs-4 has-text-danger">A step is required</p>
          ) : null}
        </FormControl>
      </FormField>
      <FormField isGrouped className="justify-end">
        <FormControl>
          <Button
            onClick={onCancel}
            size="small"
            type="button"
            name="cancel step"
          >
            Cancel
          </Button>
        </FormControl>
        <FormControl>
          <Button
            variant="primary"
            size="small"
            disabled={step === ""}
            type="submit"
            name="save step"
            loading={addStep.isLoading}
          >
            Add
          </Button>
        </FormControl>
      </FormField>
    </form>
  )
}

export default AddStep
