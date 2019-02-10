import React from "react"

import AddStepForm from "@/components/AddStepForm"
import GlobalEvent from "@/components/GlobalEvent"
import { IStep } from "@/store/reducers/recipes"

interface IAddStepProps {
  readonly addStep: (args: { id: IStep["id"]; step: IStep["text"] }) => void
  readonly onCancel: () => void
  readonly loading?: boolean
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
  static defaultProps = {
    loading: false
  }

  state = {
    step: ""
  }

  handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    this.setState({ step: e.target.value })
  }

  clearStep = () => {
    this.props.onCancel()
  }

  addStep = async () => {
    // TODO(sbdchd): fix this
    this.props.addStep({ id: this.props.id, step: this.state.step })
    this.setState({ step: "" })
  }
  handleKeyUp = (e: KeyboardEvent) => {
    if (e.key === "Escape") {
      this.clearStep()
    }
  }

  render() {
    const { handleInputChange, addStep, clearStep } = this
    const { index, loading, autoFocus } = this.props
    const { step } = this.state
    return (
      <>
        <GlobalEvent keyUp={this.handleKeyUp} />
        <AddStepForm
          handleInputChange={handleInputChange}
          addStep={addStep}
          cancelAddStep={clearStep}
          stepNumber={index}
          text={step}
          loading={loading}
          autoFocus={autoFocus}
        />
      </>
    )
  }
}
