import { useQueryClient } from "@tanstack/react-query"
import { AxiosError } from "axios"
import React, { useState } from "react"
import { RouteComponentProps, useHistory } from "react-router-dom"

import { login } from "@/auth"
import { BorderBox } from "@/components/BorderBox"
import { Button } from "@/components/Buttons"
import { FormErrorHandler } from "@/components/FormErrorHandler"
import { Helmet } from "@/components/Helmet"
import { Label } from "@/components/Label"
import { AuthPage } from "@/components/Page"
import { PasswordInput } from "@/components/PasswordInput"
import { Link } from "@/components/Routing"
import { pathHome, pathLogin } from "@/paths"
import { useAuthPasswordResetConfirm } from "@/queries/authPasswordResetConfirm"
import { toast } from "@/toast"

type RouteProps = RouteComponentProps<{ uid: string; token: string }>

function formatError(error: unknown) {
  // eslint-disable-next-line @typescript-eslint/consistent-type-assertions, @typescript-eslint/no-unsafe-assignment
  const err = error as AxiosError | undefined
  if (err == null) {
    return {}
  }
  if (err.response?.status === 400) {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    const data: {
      token?: string[]
      new_password1?: string[]
      new_password2?: string[]
      uid?: string[]
      non_field_errors?: string[]
    } = err.response?.data

    const tokenData =
      data["token"]?.map((x: unknown) => "token: " + String(x)) ?? []
    const uidData = data["uid"]?.map((x: unknown) => "uid: " + String(x)) ?? []
    const nonFieldErrors = (data["non_field_errors"] ?? [])
      .concat(tokenData)
      .concat(uidData)

    return {
      newPassword1: data["new_password1"],
      newPassword2: data["new_password2"],
      nonFieldErrors,
    }
  }
  return {}
}

export function PasswordResetConfirmPage(props: RouteProps) {
  const [newPassword1, setNewPassword1] = useState("")
  const [newPassword2, setNewPassword2] = useState("")
  const resetPassword = useAuthPasswordResetConfirm()
  const uid = props.match.params.uid
  const token = props.match.params.token
  const history = useHistory()
  const queryClient = useQueryClient()

  const handleReset = (e: React.FormEvent) => {
    e.preventDefault()
    resetPassword.mutate(
      {
        uid,
        token,
        newPassword1,
        newPassword2,
      },
      {
        onSuccess: (res) => {
          login(res, queryClient)
          history.push(pathHome({}))
        },
        onSettled: () => {
          setNewPassword1("")
          setNewPassword2("")
        },
        onError: () => {
          toast.error("uh oh! problem resetting password")
        },
      },
    )
  }

  const errors = formatError(resetPassword.error)

  return (
    <AuthPage>
      <BorderBox p={3}>
        <Helmet title="Password Reset" />
        <form onSubmit={handleReset}>
          <h1 className="text-xl">Password Reset Confirmation</h1>

          <FormErrorHandler error={errors.nonFieldErrors} />

          <div>
            <Label>Password</Label>
            <PasswordInput
              autoFocus
              onChange={(e) => {
                setNewPassword1(e.target.value)
              }}
              name="newPassword1"
              value={newPassword1}
            />
            <FormErrorHandler error={errors.newPassword1} />
          </div>

          <div>
            <Label>Password Again</Label>
            <PasswordInput
              onChange={(e) => {
                setNewPassword2(e.target.value)
              }}
              name="newPassword2"
              value={newPassword2}
            />
            <FormErrorHandler error={errors.newPassword2} />
          </div>

          <div className="flex justify-between">
            <Button
              variant="primary"
              loading={resetPassword.isPending}
              type="submit"
            >
              Change Password
            </Button>

            <Link to={pathLogin({})}>To Login</Link>
          </div>
        </form>
      </BorderBox>
    </AuthPage>
  )
}
