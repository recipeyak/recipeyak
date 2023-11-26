import { AxiosError } from "axios"
import React, { useState } from "react"
import { useHistory } from "react-router"

import { Button } from "@/components/Buttons"
import { FormControl } from "@/components/FormControl"
import { FormField } from "@/components/FormField"
import { PasswordInput } from "@/components/Forms"
import { Helmet } from "@/components/Helmet"
import { Label } from "@/components/Label"
import { NavPage } from "@/components/Page"
import { pathHome } from "@/paths"
import { useAuthPasswordChange } from "@/queries/authPasswordChange"
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
    <NavPage>
      <form onSubmit={handleSubmit} className="mx-auto my-0 max-w-[400px]">
        <Helmet title="Password Change" />
        <h2 className="text-xl">Password Change</h2>

        <FormField>
          <Label>Current Password</Label>
          <FormControl>
            <PasswordInput
              autoFocus
              onChange={(e) => {
                setOldPassword(e.target.value)
              }}
              error={error?.code === "invalid_password"}
              name="oldPassword"
              required
            />
          </FormControl>
        </FormField>

        <FormField>
          <Label>New Password</Label>
          <FormControl>
            <PasswordInput
              onChange={(e) => {
                setNewPassword(e.target.value)
              }}
              name="newPassword"
              required
            />
          </FormControl>
        </FormField>

        <FormField>
          <Label>New Password Again</Label>
          <FormControl>
            <PasswordInput
              onChange={(e) => {
                setNewPasswordAgain(e.target.value)
              }}
              name="newPasswordAgain"
              required
            />
          </FormControl>
        </FormField>

        <FormControl>
          <Button
            variant="primary"
            type="submit"
            className="w-full"
            loading={passwordChange.isPending}
          >
            Update
          </Button>
        </FormControl>
        {error != null && <div>{error.message}</div>}
      </form>
    </NavPage>
  )
}
