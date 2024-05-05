import React from "react"

import { Modal } from "@/components/Modal"
import { Kbd } from "@/pages/schedule/Kbd"

const keybinds = [
  {
    key: ["Delete", "#"],
    description: "Remove a scheduled recipe",
  },
  {
    key: "?",
    description: "Toggle help menu",
  },
]

const hints = [
  {
    title: "Schedule a recipe",
    description: "Press the 'schedule' button.",
  },
  {
    title: "Delete a recipe",
    description: "Click calendar recipe > Reschedule > Remove from Schedule.",
  },
]

interface IKeyBindProps {
  readonly bind: string | ReadonlyArray<string>
}

function KeyBind({ bind }: IKeyBindProps) {
  return (
    <div>
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
  onOpenChange,
}: {
  show: boolean
  onOpenChange: (_: boolean) => void
}) {
  return (
    <Modal
      isOpen={show}
      onOpenChange={onOpenChange}
      title="Keybinds & Tips"
      children={
        <div className="mt-2 flex flex-col gap-1">
          <div>
            <div className="font-medium">Keybinds</div>
            <div className="flex flex-col gap-1">
              {keybinds.map((keybind) => (
                <div key={keybind.description}>
                  <div className="font-medium">{keybind.description}</div>
                  <div className="flex gap-1">
                    <span>Press</span>
                    <KeyBind bind={keybind.key} key={keybind.description} />
                  </div>
                </div>
              ))}
            </div>
          </div>
          <div>
            <div className="font-medium">Tips</div>
            <div className="flex flex-col gap-1">
              {hints.map((hint) => (
                <div key={hint.title}>
                  <div className="font-medium">{hint.title}</div>
                  <div>{hint.description}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      }
    />
  )
}
