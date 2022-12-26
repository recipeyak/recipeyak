import { AxiosError } from "axios"
import React, { useState } from "react"
import { useHistory } from "react-router"

import { Button } from "@/components/Buttons"
import { PasswordInput } from "@/components/Forms"
import { Helmet } from "@/components/Helmet"
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

function PasswordChange() {
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
          history.push("/")
          toast.success("Successfully updated password")
        },
      },
    )
  }

  const error = formatError(passwordChange.error)

  return (
    <form onSubmit={handleSubmit} className="max-width-400px margin-0-auto">
      <Helmet title="Password Change" />
      <h2 className="title is-3">Password Change</h2>

      <div className="field">
        <label className="label">Current Password</label>
        <div className="control">
          <PasswordInput
            autoFocus
            onChange={(e) => {
              setOldPassword(e.target.value)
            }}
            error={error?.code === "invalid_password"}
            name="oldPassword"
            required
          />
        </div>
      </div>

      <div className="field">
        <label className="label">New Password</label>
        <div className="control">
          <PasswordInput
            onChange={(e) => {
              setNewPassword(e.target.value)
            }}
            name="newPassword"
            required
          />
        </div>
      </div>

      <div className="field">
        <label className="label">New Password Again</label>
        <div className="control">
          <PasswordInput
            onChange={(e) => {
              setNewPasswordAgain(e.target.value)
            }}
            name="newPasswordAgain"
            required
          />
        </div>
      </div>

      <p className="control">
        <Button
          variant="primary"
          type="submit"
          className="w-100"
          loading={passwordChange.isLoading}
        >
          Update
        </Button>
      </p>
      {error != null && <div>{error.message}</div>}
    </form>
  )
}

export default PasswordChange
