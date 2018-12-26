import React from "react"

import AddStepForm from "./AddStepForm"
import { IStep } from "../store/reducers/recipes"

interface IAddStepProps {
  readonly addStep: (id: IStep["id"], step: string) => Promise<void>
  readonly onCancel: () => void
  readonly loading: boolean
  readonly autoFocus?: boolean
  readonly id: number
  readonly index: number
}

interface IAddStepState {
  readonly step: string
}

export default class AddStep extends React.Component<
  IAddStepProps,
  IAddStepState
> {
  static readonly defaultProps = {
    loading: false
  }

  readonly state = {
    step: ""
  }

  readonly handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    this.setState({ step: e.target.value })
  }

  readonly clearStep = () => {
    this.props.onCancel()
    this.setState({ step: "" })
  }

  readonly addStep = async () => {
    await this.props.addStep(this.props.id, this.state.step)
    this.setState({ step: "" })
  }

  render() {
    const { handleInputChange, addStep, clearStep } = this

    const { index, loading, autoFocus } = this.props

    const { step } = this.state

    return (
      <AddStepForm
        handleInputChange={handleInputChange}
        addStep={addStep}
        cancelAddStep={clearStep}
        stepNumber={index}
        text={step}
        loading={loading}
        autoFocus={autoFocus}
      />
    )
  }
}
