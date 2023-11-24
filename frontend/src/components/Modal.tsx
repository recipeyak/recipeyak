import React, { useRef } from "react"

import { BorderBox } from "@/components/BorderBox"
import { Box } from "@/components/Box"
import { CloseButton } from "@/components/CloseButton"
import { useGlobalEvent } from "@/hooks"
import { styled } from "@/theme"

interface IModalProps {
  readonly onClose: () => void
  readonly show: boolean
  readonly content: React.ReactNode
  readonly title: string
}

const ModalPositioner = styled.div`
  align-items: center;
  display: none;
  justify-content: center;
  overflow: hidden;
  position: fixed;
  z-index: 20;
  // Modifiers
  &.is-active {
    display: flex;
  }
  inset: 0;
`

const ModalContainer = styled.div`
  position: relative;
  margin-top: 8vh;
  width: 400px;

  @media (max-width: 450px) {
    width: 100%;
    margin: 0;
    height: 100dvh;
  }
`

const ModalBackground = styled.div`
  background-color: var(--color-modal-background);
  position: absolute;
  inset: 0;
`

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
    <ModalPositioner
      ref={ref}
      style={{ display: show ? "flex" : undefined, alignItems: "flex-start" }}
    >
      <ModalBackground onClick={onClose} />
      <ModalContainer>
        <BorderBox display="flex" flexDirection="column" h={100}>
          <Box space="between" mb={2}>
            <h1 className="fs-14px fw-500">{title}</h1>
            <CloseButton onClose={onClose} />
          </Box>
          {content}
        </BorderBox>
      </ModalContainer>
    </ModalPositioner>
  )
}
