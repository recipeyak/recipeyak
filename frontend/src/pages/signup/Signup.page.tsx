import { useQueryClient } from "@tanstack/react-query"
import { AxiosError } from "axios"
import React, { useState } from "react"
import { Link, useHistory } from "react-router-dom"

import { login } from "@/auth"
import AuthContainer from "@/components/AuthContainer"
import { Button } from "@/components/Buttons"
import { EmailInput, FormErrorHandler, PasswordInput } from "@/components/Forms"
import { Helmet } from "@/components/Helmet"
import { Tab, Tabs } from "@/components/Tabs"
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

function Signup() {
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
          history.push("/recipes/add")
        },
      },
    )
  }

  const errors = formatError(signup.error)

  return (
    <AuthContainer>
      <div className="box p-3">
        <Helmet title="Sign Up" />
        <Tabs>
          <Tab>
            <Link to="/login" className="text-decoration-none">
              Login
            </Link>
          </Tab>
          <Tab isActive>
            <Link to="/signup" className="text-decoration-none">
              Sign Up
            </Link>
          </Tab>
        </Tabs>

        <form onSubmit={handleSignup}>
          <div className="field">
            <label className="label">Email</label>
            <EmailInput
              onChange={(e) => {
                setEmail(e.target.value)
              }}
              autoFocus
              name="email"
              placeholder="rick.sanchez@me.com"
            />
          </div>

          <div className="field">
            <label htmlFor="password1" className="label">
              Password
            </label>
            <PasswordInput
              onChange={(e) => {
                setPassword1(e.target.value)
              }}
              name="password1"
              id="password1"
              placeholder="Super secret password."
            />
          </div>

          <div className="field">
            <label htmlFor="password2" className="label">
              Password Again
            </label>
            <PasswordInput
              onChange={(e) => {
                setPassword2(e.target.value)
              }}
              name="password2"
              id="password2"
              placeholder="Enter your password again."
            />
          </div>

          <FormErrorHandler error={errors != null ? [errors] : null} />

          <div className="field d-flex flex-space-between align-items-center">
            <Button variant="primary" type="submit" loading={signup.isLoading}>
              Submit
            </Button>

            <Link to="/password-reset">Forgot Password?</Link>
          </div>
        </form>
      </div>
    </AuthContainer>
  )
}

export default Signup
