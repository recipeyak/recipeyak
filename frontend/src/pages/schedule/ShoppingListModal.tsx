import React from "react"

import { Modal } from "@/components/Modal"

export function ShoppingListModal({
  show,
  onClose,
  children,
}: {
  show: boolean
  onClose: () => void
  children: React.ReactNode
}) {
  return (
    <Modal
      show={show}
      onClose={onClose}
      title="Shopping List"
      content={<div className="d-flex">{children}</div>}
    />
  )
}
