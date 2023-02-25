import React, { useRef } from "react"

import { classNames } from "@/classnames"
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

const ModalContainer = styled.div`
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

const ModalContent = styled.div`
  margin: 0 20px;
  max-height: calc(100vh - 160px);
  overflow: auto;
  position: relative;
  width: 100%;
  @media screen and (min-width: 769px), print {
    margin: 0 auto;
    max-height: calc(100vh - 40px);
    width: 640px;
  }
`

const ModalBackground = styled.div`
  background-color: hsla(0, 0%, 4%, 0.86);
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
    <ModalContainer
      ref={ref}
      style={{ display: show ? "flex" : undefined, alignItems: "flex-start" }}
    >
      <ModalBackground onClick={onClose} />
      <ModalContent
        style={{
          maxWidth: 400,
          width: 400,
          overflowY: "hidden",
          margin: 20,
          marginTop: "8vh",
          fontSize: 14,
        }}
      >
        <BorderBox display="flex" flexDirection="column" h={100}>
          <Box space="between" mb={2}>
            <h1 className="fs-14px fw-500">{title}</h1>
            <CloseButton onClose={onClose} />
          </Box>
          {content}
        </BorderBox>
      </ModalContent>
    </ModalContainer>
  )
}
