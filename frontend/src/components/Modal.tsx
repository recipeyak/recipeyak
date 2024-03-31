import React from "react"
import { Dialog, Modal as AriaModal, ModalOverlay } from "react-aria-components"

import { clx } from "@/classnames"
import { CloseButton } from "@/components/CloseButton"

export function Modal({
  isOpen,
  onOpenChange,
  children,
  title,
  full = false,
}: {
  title: React.ReactNode
  isOpen?: boolean
  onOpenChange?: ((_: boolean) => void) | undefined
  children: React.ReactNode | ((_: { close: () => void }) => React.ReactNode)
  full?: boolean
}) {
  return (
    <ModalOverlay
      className="fixed inset-0 z-[1000] flex min-h-full justify-center overflow-y-auto bg-[--color-modal-background] sm:p-3"
      isDismissable
      isOpen={isOpen}
      onOpenChange={onOpenChange}
    >
      <AriaModal
        className={clx(
          "h-full w-full overflow-hidden bg-[--color-background-card] p-6 shadow-xl outline-none sm:rounded-md",
          !full && "sm:mt-[8vh] sm:h-[max-content] sm:max-w-md",
        )}
      >
        <Dialog className="h-full outline-none">
          {({ close }) => (
            <div
              onClick={(e) => {
                // disable clicking so we can put this anywhere in the DOM and
                // ensure we don't click stuff behind it
                e.stopPropagation()
              }}
              className="h-full"
            >
              <div className="flex items-center justify-between">
                <div>{title}</div>
                <CloseButton
                  onClose={() => {
                    close()
                  }}
                />
              </div>
              {typeof children === "function" ? children({ close }) : children}
            </div>
          )}
        </Dialog>
      </AriaModal>
    </ModalOverlay>
  )
}
