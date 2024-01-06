import { X } from "react-feather"

import { Box } from "@/components/Box"
import { Button } from "@/components/Buttons"

export function CloseButton({ onClose }: { onClose?: () => void }) {
  return (
    <Button
      size="small"
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
    </Button>
  )
}
