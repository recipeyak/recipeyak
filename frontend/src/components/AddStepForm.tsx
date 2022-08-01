import React from "react"
import Textarea from "react-textarea-autosize"

import { ButtonPrimary, Button } from "@/components/Buttons"

interface IAddStepFormProps {
  readonly handleInputChange: (
    e: React.ChangeEvent<HTMLTextAreaElement>,
  ) => void
  readonly addStep: () => void
  readonly cancelAddStep: () => void
  readonly stepNumber: number
  readonly text: string
  readonly loading?: boolean
  readonly error?: boolean
  readonly autoFocus?: boolean
}

const AddStepForm = ({
  handleInputChange,
  addStep,
  cancelAddStep,
  stepNumber,
  text,
  loading = false,
  error = false,
  autoFocus = false,
}: IAddStepFormProps) => (
  <form
    onSubmit={(e) => {
      e.preventDefault()
      if (text === "") {
        return
      }
      addStep()
    }}
  >
    <div className="field">
      <label className="better-label">Step {stepNumber}</label>
      <div className="control mt-2">
        <Textarea
          onChange={handleInputChange}
          autoFocus={autoFocus}
          onKeyPress={(e) => {
            if (text === "") {
              return
            }
            if (e.shiftKey && e.key === "Enter") {
              e.preventDefault()
              addStep()
            }
          }}
          value={text}
          className={"my-textarea" + (error ? " is-danger" : "")}
          placeholder="Add a step..."
          name="step"
        />
        {error ? <p className="fs-4 c-danger">A step is required</p> : null}
      </div>
    </div>
    <div className="field is-grouped justify-end">
      <p className="control">
        <Button
          onClick={cancelAddStep}
          size="small"
          type="button"
          name="cancel step"
        >
          Cancel
        </Button>
      </p>
      <p className="control">
        <ButtonPrimary
          size="small"
          disabled={text === ""}
          type="submit"
          name="save step"
          loading={loading}
        >
          Add
        </ButtonPrimary>
      </p>
    </div>
  </form>
)

export default AddStepForm
