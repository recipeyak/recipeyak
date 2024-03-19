import { useState } from "react"

import { Button } from "@/components/Buttons"
import { BetterLabel } from "@/components/Label"
import { Textarea } from "@/components/Textarea"
import { useStepCreate } from "@/queries/useStepCreate"

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
      className="flex flex-col gap-2"
    >
      <div className="flex flex-col gap-2">
        <BetterLabel>Step {index}</BetterLabel>
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
          isError={!!addStep.error}
          placeholder="Add a step..."
          name="step"
        />
        {addStep.error ? (
          // eslint-disable-next-line react/forbid-elements
          <p className="text-base text-[--color-danger]">A step is required</p>
        ) : null}
      </div>
      <div className="flex justify-end gap-2">
        <Button onClick={onCancel} size="small" type="button">
          Cancel
        </Button>
        <Button
          variant="primary"
          size="small"
          disabled={step === ""}
          type="submit"
          aria-label="add step"
          loading={addStep.isPending}
        >
          Add Step
        </Button>
      </div>
    </form>
  )
}

export default AddStep
