import { Link } from "react-router-dom"

import { Box } from "@/components/Box"
import { BetterLabel } from "@/components/Label"
import { pathPassword } from "@/paths"

export function ChangePassword() {
  return (
    <Box dir="col" className="gap-1">
      <BetterLabel>Password</BetterLabel>
      <Link
        to={pathPassword({})}
        className="self-start rounded-md border border-solid border-[--color-border] bg-[--color-background-card] px-2 py-1 text-xs font-medium"
      >
        Change password
      </Link>
    </Box>
  )
}
