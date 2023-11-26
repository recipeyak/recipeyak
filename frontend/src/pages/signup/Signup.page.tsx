import { useQueryClient } from "@tanstack/react-query"
import { AxiosError } from "axios"
import React, { useState } from "react"
import { Link, useHistory } from "react-router-dom"

import { login } from "@/auth"
import { BorderBox } from "@/components/BorderBox"
import { Button } from "@/components/Buttons"
import { FormField } from "@/components/FormField"
import { EmailInput, FormErrorHandler, PasswordInput } from "@/components/Forms"
import { Helmet } from "@/components/Helmet"
import { Label } from "@/components/Label"
import { AuthPage } from "@/components/Page"
import { Tab, Tabs } from "@/components/Tabs"
import {
  pathLogin,
  pathPasswordReset,
  pathRecipeAdd,
  pathSignup,
} from "@/paths"
import { useAuthSignup } from "@/queries/authSignup"

function formatError(error: unknown) {
  // eslint-disable-next-line @typescript-eslint/consistent-type-assertions
  const err = error as AxiosError | undefined
  if (err == null) {
    return null
  }
  if (err.response?.status === 400) {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    const data: {
      error?: {
        message: string
      }
    } = err.response?.data
    return data.error?.message
  } else {
    return "Something went wrong with the server."
  }
}

export function SignupPage() {
  const [email, setEmail] = useState("")
  const [password1, setPassword1] = useState("")
  const [password2, setPassword2] = useState("")

  const signup = useAuthSignup()
  const history = useHistory()
  const queryClient = useQueryClient()

  const handleSignup = (e: React.FormEvent) => {
    e.preventDefault()
    signup.mutate(
      {
        email,
        password1,
        password2,
      },
      {
        onSuccess: (res) => {
          login(res.user, queryClient)
          history.push(pathRecipeAdd({}))
        },
      },
    )
  }

  const errors = formatError(signup.error)

  return (
    <AuthPage>
      <BorderBox p={3}>
        <Helmet title="Sign Up" />
        <Tabs>
          <Tab>
            <Link to={pathLogin({})} className="no-underline">
              Login
            </Link>
          </Tab>
          <Tab isActive>
            <Link to={pathSignup({})} className="no-underline">
              Sign Up
            </Link>
          </Tab>
        </Tabs>

        <form onSubmit={handleSignup}>
          <FormField>
            <Label>Email</Label>
            <EmailInput
              onChange={(e) => {
                setEmail(e.target.value)
              }}
              autoFocus
              name="email"
              placeholder="rick.sanchez@me.com"
            />
          </FormField>

          <FormField>
            <Label htmlFor="password1">Password</Label>
            <PasswordInput
              onChange={(e) => {
                setPassword1(e.target.value)
              }}
              name="password1"
              id="password1"
              placeholder="Super secret password."
            />
          </FormField>

          <FormField>
            <Label htmlFor="password2">Password Again</Label>
            <PasswordInput
              onChange={(e) => {
                setPassword2(e.target.value)
              }}
              name="password2"
              id="password2"
              placeholder="Enter your password again."
            />
          </FormField>

          <FormErrorHandler error={errors != null ? [errors] : null} />

          <FormField className="flex items-center justify-between">
            <Button variant="primary" type="submit" loading={signup.isPending}>
              Submit
            </Button>

            <Link to={pathPasswordReset({})}>Forgot Password?</Link>
          </FormField>
        </form>
      </BorderBox>
    </AuthPage>
  )
}
