import React from "react"

import AddStepForm from "@/components/AddStepForm"
import GlobalEvent from "@/components/GlobalEvent"
import {
  IStep,
  addStepToRecipe,
  setRecipeStepDraft,
  IRecipe
} from "@/store/reducers/recipes"
import { connect } from "react-redux"

interface IAddStepProps {
  readonly addStep: (args: {
    id: IStep["id"]
    step: IRecipe["draftStep"]
  }) => void
  readonly step?: string
  readonly setStep: (args: {
    id: IRecipe["id"]
    draftStep: IRecipe["draftStep"]
  }) => void
  readonly onCancel: () => void
  readonly loading?: boolean
  readonly autoFocus?: boolean
  readonly id: number
  readonly index: number
}

function AddStep(props: IAddStepProps) {
  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) =>
    props.setStep({ id: props.id, draftStep: e.target.value })

  const clearStep = () => props.onCancel()

  const addStep = () => props.addStep({ id: props.id, step: props.step })

  const handleKeyUp = (e: KeyboardEvent) => {
    if (e.key === "Escape") {
      clearStep()
    }
  }

  return (
    <>
      <GlobalEvent keyUp={handleKeyUp} />
      <AddStepForm
        handleInputChange={handleInputChange}
        addStep={addStep}
        cancelAddStep={clearStep}
        stepNumber={props.index}
        text={props.step || ""}
        loading={props.loading}
        autoFocus={props.autoFocus}
      />
    </>
  )
}

const mapDispatchToProps = {
  addStep: addStepToRecipe.request,
  setStep: setRecipeStepDraft
}

export default connect(null, mapDispatchToProps)(AddStep)
