import { AxiosError } from "axios"
import React, { useState } from "react"
import { Link } from "react-router-dom"

import { useIsLoggedIn } from "@/auth"
import { BorderBox } from "@/components/BorderBox"
import { Button } from "@/components/Buttons"
import { EmailInput } from "@/components/EmailInput"
import { FormErrorHandler } from "@/components/FormErrorHandler"
import { Label } from "@/components/Label"
import { AuthPage } from "@/components/Page"
import { useAuthPasswordReset } from "@/queries/useAuthPasswordReset"
import { toast } from "@/toast"

function formatError(error: unknown) {
  // eslint-disable-next-line @typescript-eslint/consistent-type-assertions
  const err = error as AxiosError | undefined
  if (err == null) {
    return {}
  }
  if (err.response?.status === 400) {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    const data: { email: string[]; non_field_errors?: string[] } =
      err.response?.data
    return {
      email: data["email"],
      nonFieldErrors: data["non_field_errors"],
    }
  }
  return {}
}

export function PasswordResetPage() {
  const [email, setEmail] = useState("")

  const resetPassword = useAuthPasswordReset()

  function handleReset(e: React.FormEvent) {
    e.preventDefault()
    toast.dismiss()
    resetPassword.mutate(
      { email },
      {
        onSuccess: (res) => {
          const message = res?.detail
          toast.success(message)
        },
        onSettled: () => {
          setEmail("")
        },
        onError: () => {
          toast.error("problem resetting password")
        },
      },
    )
  }

  const errors = formatError(resetPassword.error)

  const isLoggedIn = useIsLoggedIn()

  const redirect = isLoggedIn
    ? { name: "Home", route: "/" }
    : { name: "Login", route: "/login" }

  return (
    <AuthPage title="Password Reset">
      <BorderBox
        p={3}
        as="form"
        onSubmit={handleReset}
        className="flex flex-col "
      >
        <h1 className="text-xl font-medium">Password Reset</h1>

        <FormErrorHandler error={errors.nonFieldErrors} />

        <div className="flex flex-col gap-2">
          <div>
            <Label>Email</Label>
            <EmailInput
              autoFocus
              onChange={(e) => {
                setEmail(e.target.value)
              }}
              name="email"
              value={email}
              required
              placeholder="a.person@me.com"
            />
            <FormErrorHandler error={errors.email} />
          </div>

          <div className="flex items-center justify-between">
            <Button loading={resetPassword.isPending} type="submit">
              Send Reset Email
            </Button>

            <Link to={redirect.route}>{redirect.name} →</Link>
          </div>
        </div>
      </BorderBox>
    </AuthPage>
  )
}
