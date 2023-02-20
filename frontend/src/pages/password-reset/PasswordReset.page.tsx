import { AxiosError } from "axios"
import React, { useState } from "react"
import { Link } from "react-router-dom"

import AuthContainer from "@/components/AuthContainer"
import { Button } from "@/components/Buttons"
import { EmailInput, FormErrorHandler } from "@/components/Forms"
import { Helmet } from "@/components/Helmet"
import { useIsLoggedIn } from "@/hooks"
import { useAuthPasswordReset } from "@/queries/authPasswordReset"
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

function PasswordReset() {
  const [email, setEmail] = useState("")

  const resetPassword = useAuthPasswordReset()

  async function handleReset(e: React.FormEvent) {
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
    <AuthContainer>
      <Helmet title="Password Reset" />
      <form className="box p-3" onSubmit={handleReset}>
        <h1 className="is-5 mb-2 fw-500">Password Reset</h1>

        <FormErrorHandler error={errors.nonFieldErrors} />

        <div className="field">
          <label className="label">Email</label>
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

        <div className="field d-flex flex-space-between align-items-center">
          <Button loading={resetPassword.isLoading} type="submit">
            Send Reset Email
          </Button>

          <Link to={redirect.route}>{redirect.name} →</Link>
        </div>
      </form>
    </AuthContainer>
  )
}

export default PasswordReset
