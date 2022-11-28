import React from "react"

import Modal from "@/components/Modal"

export function ShoppingListModal({
  show,
  onClose,
  children,
  className,
}: {
  show: boolean
  onClose: () => void
  children: React.ReactNode
  className?: string
}) {
  return (
    <Modal
      show={show}
      style={{ maxWidth: 400, width: 400 }}
      onClose={onClose}
      className={className}
    >
      <section className="d-flex space-between">
        <h1 className="fs-4 bold">Shopping List</h1>
        <button className="delete" aria-label="close" onClick={onClose} />
      </section>
      <section className={`d-flex ${className}`}>{children}</section>
    </Modal>
  )
}
