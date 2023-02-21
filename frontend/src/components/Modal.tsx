import React, { useRef } from "react"

import { classNames } from "@/classnames"
import { Box } from "@/components/Box"
import { CloseButton } from "@/components/CloseButton"
import { useGlobalEvent } from "@/hooks"

interface IModalProps {
  readonly onClose: () => void
  readonly show: boolean
  readonly content: React.ReactNode
  readonly title: string
}

export function Modal({ show, content, onClose, title }: IModalProps) {
  const ref = useRef<HTMLDivElement>(null)
  useGlobalEvent({
    keyUp: (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose()
      }
    },
  })
  if (!show) {
    return null
  }
  return (
    <div
      ref={ref}
      className={classNames("modal", { "is-active": show })}
      style={{ alignItems: "flex-start" }}
    >
      <div className="modal-background" onClick={onClose} />
      <div
        className="modal-content overflow-y-auto fs-14px"
        style={{
          maxWidth: 400,
          width: 400,
          overflowY: "hidden",
          margin: 20,
          marginTop: "8vh",
        }}
      >
        <div className="box d-flex flex-direction-column h-100">
          <Box space="between" mb={2}>
            <h1 className="fs-14px fw-500">{title}</h1>
            <CloseButton onClose={onClose} />
          </Box>
          {content}
        </div>
      </div>
    </div>
  )
}
