import { X } from "lucide-react"

export function CloseButton({ onClose }: { onClose?: () => void }) {
  return (
    // Workaround for https://github.com/adobe/react-spectrum/issues/1513 we use
    // a normal button instead of the react-aria one, which was causing pressing
    // close on the modal to also trigger a click on any elements behind it
    //
    // eslint-disable-next-line react/forbid-elements
    <button
      type="button"
      onClick={onClose}
      data-testid="close modal"
      className="cursor-pointer !border-none bg-[unset] p-0 !shadow-none"
    >
      <div className="rounded-full bg-[--color-background-card] p-1 text-[--color-text]">
        <X size={14} strokeWidth={3} />
      </div>
    </button>
  )
}

/**
 * Larger click target button
 */
export function ModalCloseButton({ onClose }: { onClose?: () => void }) {
  return (
    // See CloseButton for why this isn't a react-aria button.
    //
    // eslint-disable-next-line react/forbid-elements
    <button
      onClick={onClose}
      data-testid="close modal"
      aria-label="Close"
      className="relative flex size-[30px] shrink-0 cursor-pointer items-center justify-center rounded-full border-none bg-[--color-normal-hover-bg] p-0 text-[--color-text-muted] before:absolute before:inset-[-7px] before:content-[''] hover:bg-[--color-normal-active-bg] hover:text-[--color-text]"
    >
      <X size={16} strokeWidth={2.5} />
    </button>
  )
}
