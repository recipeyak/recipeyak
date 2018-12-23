import React from "react"

import Modal from "./Modal"

interface IHelpMenuModalState {
  readonly show: boolean
}

export default class HelpMenuModal extends React.Component<
  {},
  IHelpMenuModalState
> {
  state = {
    show: false
  }

  componentWillMount() {
    document.addEventListener("keypress", this.handleKeyPress)
  }

  componentWillUnmount() {
    document.removeEventListener("keypress", this.handleKeyPress)
  }

  handleKeyPress = (e: KeyboardEvent) => {
    const el = document.activeElement
    if (el == null || el.tagName !== "BODY") {
      return
    }
    if (e.key === "?") {
      this.setState(prev => ({ show: !prev.show }))
    }
  }

  close = () => {
    this.setState({ show: false })
  }
  render() {
    const keybinds = [
      {
        key: "#",
        description: "delete scheduled recipe"
      },
      {
        key: "?",
        description: "toggle help menu"
      },
      {
        key: "A",
        description: "increment scheduled recipe amount"
      },
      {
        key: "X",
        description: "decrement scheduled recipe amount"
      },
      {
        key: "f",
        description: "open search box"
      }
    ]
    return (
      <Modal show={this.state.show} onClose={() => this.close()}>
        <section className="d-flex space-between">
          <h1 className="fs-4 bold">Keybinds</h1>
          <button className="delete" aria-label="close" onClick={this.close} />
        </section>
        <section className="d-flex">
          <div className="mr-4">
            {keybinds.map(({ description }) => (
              <div className="mb-1" key={description}>
                {description}
              </div>
            ))}
          </div>
          <div>
            {keybinds.map(({ key }) => (
              <div className="mb-1" key={key}>
                <kbd>{key}</kbd>
              </div>
            ))}
          </div>
        </section>
      </Modal>
    )
  }
}
