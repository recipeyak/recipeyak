import React from "react"
import { Dialog, Modal as AriaModal, ModalOverlay } from "react-aria-components"

import { CloseButton } from "@/components/CloseButton"

export function Modal({
  isOpen,
  onOpenChange,
  children,
  title,
}: {
  title: React.ReactNode
  isOpen: boolean
  onOpenChange: (_: boolean) => void
  children: React.ReactNode
}) {
  return (
    <ModalOverlay
      className="fixed inset-0 z-10 flex min-h-full justify-center overflow-y-auto bg-[--color-modal-background] sm:p-3"
      isDismissable
      isOpen={isOpen}
      onOpenChange={(change) => {
        onOpenChange(change)
      }}
    >
      <AriaModal className="h-full w-full overflow-hidden bg-[--color-background-card] p-6 shadow-xl outline-none sm:mt-[8vh] sm:h-[max-content] sm:max-w-md sm:rounded-md">
        <Dialog className="outline-none">
          <div className="flex items-center justify-between">
            <div>{title}</div>
            <CloseButton
              onClose={() => {
                onOpenChange(false)
              }}
            />
          </div>
          {children}
        </Dialog>
      </AriaModal>
    </ModalOverlay>
  )
}
