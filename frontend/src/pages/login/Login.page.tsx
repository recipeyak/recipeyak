import { useQueryClient } from "@tanstack/react-query"
import { AxiosError } from "axios"
import { Location } from "history"
import React from "react"
import { Link, useHistory, useLocation } from "react-router-dom"

import { login } from "@/auth"
import { Button } from "@/components/Buttons"
import { FormErrorHandler } from "@/components/FormErrorHandler"
import { Label } from "@/components/Label"
import { AuthPage } from "@/components/Page"
import { PasswordInput } from "@/components/PasswordInput"
import { Tab, Tabs } from "@/components/Tabs"
import { TextInput } from "@/components/TextInput"
import { pathLogin, pathPasswordReset, pathSignup } from "@/paths"
import { useAuthLogin } from "@/queries/useAuthLogin"

function formatError(error: unknown) {
  // eslint-disable-next-line @typescript-eslint/consistent-type-assertions
  const err = error as AxiosError | undefined
  if (err == null) {
    return
  }
  if (err.response?.status === 400) {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    const data: {
      email?: string[]
      password1?: string[]
      non_field_errors?: string[]
    } = err.response.data
    return {
      email: data.email,
      password: data.password1,
      nonFieldErrors: data.non_field_errors,
    }
  } else {
    return {
      nonFieldErrors: ["Something went wrong with the server."],
    }
  }
}

export function LoginPage() {
  const [email, setEmail] = React.useState("")
  const [password, setPassword] = React.useState("")
  const history = useHistory()
  const location = useLocation<{ from: Location } | undefined>()
  const authLogin = useAuthLogin()
  const queryClient = useQueryClient()

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    authLogin.mutate(
      { email, password },
      {
        onSuccess: (res) => {
          void login(res.user, queryClient).then(() => {
            history.push(location.state?.from ?? {})
          })
        },
      },
    )
  }

  const errors = formatError(authLogin.error)

  return (
    <AuthPage title="Login">
      <div className="rounded-none bg-[--color-background] p-3 text-[--color-text] sm:rounded-md">
        <Tabs>
          <Tab isActive>
            <Link to={pathLogin({})} className="no-underline">
              Login
            </Link>
          </Tab>
          <Tab isActive={false}>
            <Link to={pathSignup({})} className="no-underline">
              Sign Up
            </Link>
          </Tab>
        </Tabs>

        <form onSubmit={handleSubmit} className="flex flex-col gap-3">
          <div>
            <Label htmlFor="email">Email</Label>
            <TextInput
              onChange={(e) => {
                setEmail(e.target.value)
              }}
              value={email}
              error={errors?.email != null}
              autoFocus
              aria-label="email"
              name="email"
              placeholder="rick.sanchez@me.com"
            />
            <FormErrorHandler error={errors?.email} />
          </div>

          <div>
            <Label htmlFor="password">Password</Label>
            <PasswordInput
              onChange={(e) => {
                setPassword(e.target.value)
              }}
              value={password}
              error={errors?.password != null}
              aria-label="password"
              name="password"
              placeholder="Super secret password."
            />
            <FormErrorHandler error={errors?.password} />
            <FormErrorHandler error={errors?.nonFieldErrors} />
          </div>

          <div className="flex items-center justify-between">
            <Button
              variant="primary"
              type="submit"
              loading={authLogin.isPending}
            >
              Sign In
            </Button>
            <Link to={pathPasswordReset({})}>Forgot Password?</Link>
          </div>
        </form>
      </div>
    </AuthPage>
  )
}
