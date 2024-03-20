import { X } from "react-feather"

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
