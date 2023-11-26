import React, { useState } from "react"

import { Box } from "@/components/Box"
import { Modal } from "@/components/Modal"
import { useGlobalEvent } from "@/hooks"
import { Kbd } from "@/pages/schedule/Kbd"

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

export default function HelpMenuModal() {
  const [show, setShow] = useState(false)

  useGlobalEvent({
    keyUp: (e: KeyboardEvent) => {
      const el = document.activeElement
      if (el == null || el.tagName !== "BODY") {
        return
      }
      if (e.key === "?") {
        setShow(true)
      }
    },
  })
  return (
    <Modal
      show={show}
      onClose={() => {
        setShow(false)
      }}
      title="Keybinds"
      content={
        <Box>
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
        </Box>
      }
    />
  )
}
