import React from "react"

import { Modal } from "@/components/Modal"
import { Kbd } from "@/pages/schedule/Kbd"

const keybinds = [
  {
    key: ["Delete", "#"],
    description: "Delete scheduled recipe",
  },
  {
    key: "?",
    description: "Toggle help menu",
  },
]

const hints = [
  {
    title: "Schedule a recipe",
    description: "Double-click on a day, or press the 'schedule' button.",
  },
  {
    title: "Delete a recipe",
    description: "Click calendar recipe > Reschedule > Delete.",
  },
]

interface IKeyBindProps {
  readonly bind: string | ReadonlyArray<string>
}

function KeyBind({ bind }: IKeyBindProps) {
  return (
    <div className="mb-1">
      {typeof bind === "string" ? (
        <Kbd key={bind}>{bind}</Kbd>
      ) : (
        bind.map((k, i) => (
          <React.Fragment key={k}>
            {i !== 0 ? <span className="mx-1">or</span> : null}
            <Kbd key={k}>{k}</Kbd>
          </React.Fragment>
        ))
      )}
    </div>
  )
}

export default function HelpMenuModal({
  show,
  close,
}: {
  show: boolean
  close: () => void
}) {
  return (
    <Modal
      show={show}
      onClose={close}
      title="Tips"
      content={
        <div className="flex flex-col gap-2">
          {keybinds.map((keybind) => (
            <div key={keybind.description}>
              <div className="font-medium">{keybind.description}</div>
              <div className="flex gap-1">
                <span>Press</span>
                <KeyBind bind={keybind.key} key={keybind.description} />
              </div>
            </div>
          ))}
          {hints.map((hint) => (
            <div key={hint.title}>
              <div className="font-medium">{hint.title}</div>
              <div>{hint.description}</div>
            </div>
          ))}
        </div>
      }
    />
  )
}
