import { AxiosError } from "axios"
import React, { useState } from "react"
import { useHistory } from "react-router"

import { Button } from "@/components/Buttons"
import { Label } from "@/components/Label"
import { NavPage } from "@/components/Page"
import { PasswordInput } from "@/components/PasswordInput"
import { pathHome } from "@/paths"
import { useAuthPasswordChange } from "@/queries/useAuthPasswordChange"
import { toast } from "@/toast"

function formatError(error: unknown) {
  // eslint-disable-next-line @typescript-eslint/consistent-type-assertions
  const err = error as AxiosError | undefined
  if (err == null) {
    return
  }
  if (err.response?.status === 400) {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    const data: {
      error?: {
        code?: "invalid_password" | "mismatched_passwords"
        message?: string
      }
    } = err.response.data
    return data.error
  }
  return
}

export function PasswordChangePage() {
  const [oldPassword, setOldPassword] = useState("")
  const [newPassword, setNewPassword] = useState("")
  const [newPasswordAgain, setNewPasswordAgain] = useState("")
  const passwordChange = useAuthPasswordChange()
  const history = useHistory()

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    passwordChange.mutate(
      {
        password1: newPassword,
        password2: newPasswordAgain,
        oldPassword,
      },
      {
        onSuccess: () => {
          history.push(pathHome({}))
          toast.success("Successfully updated password")
        },
      },
    )
  }

  const error = formatError(passwordChange.error)

  return (
    <NavPage title="Password Change">
      <form onSubmit={handleSubmit} className="mx-auto my-0 max-w-[400px] ">
        <h2 className="text-xl">Password Change</h2>
        <div className="flex flex-col gap-4">
          <div>
            <Label htmlFor="oldPassword">Current Password</Label>
            <PasswordInput
              autoFocus
              onChange={(e) => {
                setOldPassword(e.target.value)
              }}
              aria-label="old password"
              error={error?.code === "invalid_password"}
              name="oldPassword"
              required
            />
          </div>

          <div>
            <Label htmlFor="newPassword">New Password</Label>
            <PasswordInput
              onChange={(e) => {
                setNewPassword(e.target.value)
              }}
              aria-label="new password"
              name="newPassword"
              required
            />
          </div>

          <div>
            <Label htmlFor="newPasswordAgain">New Password Again</Label>
            <PasswordInput
              onChange={(e) => {
                setNewPasswordAgain(e.target.value)
              }}
              aria-label="new password again"
              name="newPasswordAgain"
              required
            />
          </div>

          <Button
            variant="primary"
            type="submit"
            className="w-full"
            loading={passwordChange.isPending}
          >
            Update Password
          </Button>
          {error != null && <div>{error.message}</div>}
        </div>
      </form>
    </NavPage>
  )
}
