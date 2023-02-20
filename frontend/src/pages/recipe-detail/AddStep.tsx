import { useState } from "react"
import Textarea from "react-textarea-autosize"

import { Button } from "@/components/Buttons"
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
      <div className="field">
        <label className="better-label">Step {index}</label>
        <div className="control mt-2">
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
        </div>
      </div>
      <div className="field is-grouped justify-end">
        <p className="control">
          <Button
            onClick={onCancel}
            size="small"
            type="button"
            name="cancel step"
          >
            Cancel
          </Button>
        </p>
        <p className="control">
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
        </p>
      </div>
    </form>
  )
}

export default AddStep
