import React from "react"

import Modal from "@/components/Modal"
import { useGlobalEvent, useToggle } from "@/hooks"

const keybinds = [
  {
    key: ["Delete", "#"],
    description: "delete scheduled recipe",
  },
  {
    key: "?",
    description: "toggle help menu",
  },
  {
    key: ["+", "A"],
    description: "increment scheduled recipe amount",
  },
  {
    key: ["-", "X"],
    description: "decrement scheduled recipe amount",
  },
]

interface IKeyBindProps {
  readonly bind: string | ReadonlyArray<string>
}

function KeyBind({ bind }: IKeyBindProps) {
  return (
    <div className="mb-1">
      {typeof bind === "string" ? (
        <kbd key={bind}>{bind}</kbd>
      ) : (
        bind.map((k, i) => (
          <React.Fragment key={k}>
            {i !== 0 ? <span className="mx-1">or</span> : null}
            <kbd key={k}>{k}</kbd>
          </React.Fragment>
        ))
      )}
    </div>
  )
}

export default function HelpMenuModal() {
  const [show, toggleShow] = useToggle()

  useGlobalEvent({
    keyUp: (e: KeyboardEvent) => {
      const el = document.activeElement
      if (el == null || el.tagName !== "BODY") {
        return
      }
      if (e.key === "?") {
        toggleShow()
      }
    },
  })
  return (
    <Modal
      show={show}
      onClose={toggleShow}
      style={{ maxWidth: 400 }}
      className="fs-14px"
    >
      <section className="d-flex space-between">
        <h1 className="fs-4 bold">Keybinds</h1>
        <button className="delete" aria-label="close" onClick={toggleShow} />
      </section>
      <section className="d-flex">
        <div className="mr-4">
          {keybinds.map((b) => (
            <div className="mb-1" key={b.description}>
              {b.description}
            </div>
          ))}
        </div>
        <div>
          {keybinds.map((b) => (
            <KeyBind bind={b.key} key={b.description} />
          ))}
        </div>
      </section>
    </Modal>
  )
}
