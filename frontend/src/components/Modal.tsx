import React, { useRef } from "react"

import { clx } from "@/classnames"
import { BorderBox } from "@/components/BorderBox"
import { Box } from "@/components/Box"
import { CloseButton } from "@/components/CloseButton"
import { useGlobalEvent } from "@/useGlobalEvent"

interface IModalProps {
  readonly onClose: () => void
  readonly show: boolean
  readonly content: React.ReactNode
  readonly title: string
}

const ModalPositioner = React.forwardRef(
  (
    {
      children,
      show,
    }: {
      children: React.ReactNode
      show: boolean
    },
    ref: React.ForwardedRef<HTMLDivElement>,
  ) => {
    return (
      <div
        ref={ref}
        className={clx(
          "fixed inset-0 z-20 items-start justify-center overflow-hidden",
          show ? "flex" : "hidden",
        )}
        children={children}
      />
    )
  },
)

function ModalContainer({ children }: { children: React.ReactNode }) {
  return (
    <div
      className="relative m-0 h-[100dvh] w-full sm:m-[inherit] sm:mt-[8vh] sm:h-[inherit] sm:w-[400px] "
      children={children}
    />
  )
}

function ModalBackground({ onClick }: { onClick?: () => void }) {
  return (
    <div
      onClick={onClick}
      className="absolute inset-0 bg-[var(--color-modal-background)]"
    />
  )
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
    <ModalPositioner ref={ref} show={show}>
      <ModalBackground onClick={onClose} />
      <ModalContainer>
        <BorderBox
          display="flex"
          flexDirection="column"
          h={100}
          className="bg-[var(--color-background-card)]"
        >
          <Box space="between" mb={2} className="items-start">
            <h1 className="font-medium">{title}</h1>
            <CloseButton onClose={onClose} />
          </Box>
          {content}
        </BorderBox>
      </ModalContainer>
    </ModalPositioner>
  )
}
