import { X } from "react-feather"

import { Box } from "@/components/Box"
import { Button } from "@/components/Buttons"
import { styled } from "@/theme"

const CloseButtonInner = styled(Button)`
  background: unset;
  padding: 0;
  border-style: none !important;
  box-shadow: none !important;
`

export function CloseButton({ onClose }: { onClose?: () => void }) {
  return (
    <CloseButtonInner size="small" onClick={onClose}>
      <Box
        style={{
          background: "var(--color-background-card)",
          color: "white",
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
    </CloseButtonInner>
  )
}
