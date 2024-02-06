import { X } from "react-feather"

import { Box } from "@/components/Box"

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
      className="!border-none bg-[unset] p-0 !shadow-none"
    >
      <Box
        // eslint-disable-next-line no-restricted-syntax
        style={{
          background: "var(--color-background-card)",
          color: "var(--color-text)",
          borderStyle: "none !important",
          boxShadow: "none !important",
          backdropFilter: "blur(10px)",
          pointerEvents: "initial",
          padding: "0.25rem",
          borderRadius: "100%",
        }}
      >
        <X size={14} strokeWidth={3} />
      </Box>
    </button>
  )
}
