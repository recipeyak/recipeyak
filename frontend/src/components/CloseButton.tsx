import { X } from "lucide-react"

export function CloseButton({ onClose }: { onClose?: () => void }) {
  return (
    // Workaround for https://github.com/adobe/react-spectrum/issues/1513 we use
    // a normal button instead of the react-aria one, which was causing pressing
    // close on the modal to also trigger a click on any elements behind it
    //
    // eslint-disable-next-line react/forbid-elements
    <button
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
 * iOS-style close button for sheets/modals: a filled circle with an xmark,
 * sized to Apple's 44x44pt minimum hit target.
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
      // 44x44 hit area with the visible 30px circle centered; negative margin
      // keeps the circle's edge aligned with the modal's content.
      className="my-[-7px] mr-[-7px] flex size-11 shrink-0 cursor-pointer items-center justify-center !border-none bg-[unset] p-0 !shadow-none"
    >
      <span className="flex size-[30px] items-center justify-center rounded-full bg-[--color-normal-hover-bg] text-[--color-text-muted] transition-colors hover:bg-[--color-normal-active-bg] hover:text-[--color-text]">
        <X size={16} strokeWidth={2.5} />
      </span>
    </button>
  )
}
