import { AxiosError } from "axios"
import React, { useState } from "react"
import { Link, useHistory } from "react-router-dom"

import AuthContainer from "@/components/AuthContainer"
import { Button } from "@/components/Buttons"
import { EmailInput, FormErrorHandler, PasswordInput } from "@/components/Forms"
import { Helmet } from "@/components/Helmet"
import { useDispatch } from "@/hooks"
import { useAuthSignup } from "@/queries/authSignup"
import { cacheUserInfo } from "@/store/reducers/user"

function formatError(error: unknown) {
  // eslint-disable-next-line @typescript-eslint/consistent-type-assertions
  const err = error as AxiosError | undefined
  if (err == null) {
    return {}
  }
  if (err.response?.status === 400) {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    const data: {
      email?: string[]
      password1?: string[]
      password2?: string[]
      non_field_errors?: string[]
    } = err.response?.data
    return {
      email: data["email"],
      password1: data["password1"],
      password2: data["password2"],
      nonFieldErrors: data["non_field_errors"],
    }
  } else {
    return {
      nonFieldErrors: ["Something went wrong with the server."],
    }
  }
}

function Signup() {
  const [email, setEmail] = useState("")
  const [password1, setPassword1] = useState("")
  const [password2, setPassword2] = useState("")

  const signup = useAuthSignup()
  const history = useHistory()
  const dispatch = useDispatch()

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
          dispatch(cacheUserInfo(res.user))
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
        <div className="tabs is-boxed mb-2">
          <ul>
            <li>
              <Link to="/login">Login</Link>
            </li>
            <li className="is-active">
              <Link to="/signup">Sign Up</Link>
            </li>
          </ul>
        </div>

        <FormErrorHandler error={errors.nonFieldErrors} />

        <form onSubmit={handleSignup}>
          <div className="field">
            <label className="label">Email</label>
            <EmailInput
              onChange={(e) => {
                setEmail(e.target.value)
              }}
              error={errors.email != null}
              autoFocus
              name="email"
              placeholder="rick.sanchez@me.com"
            />
            <FormErrorHandler error={errors.email} />
          </div>

          <div className="field">
            <label htmlFor="password1" className="label">
              Password
            </label>
            <PasswordInput
              onChange={(e) => {
                setPassword1(e.target.value)
              }}
              error={errors.password1 != null}
              name="password1"
              id="password1"
              placeholder="Super secret password."
            />
            <FormErrorHandler error={errors.password1} />
          </div>

          <div className="field">
            <label htmlFor="password2" className="label">
              Password Again
            </label>
            <PasswordInput
              onChange={(e) => {
                setPassword2(e.target.value)
              }}
              error={errors.password2 != null}
              name="password2"
              id="password2"
              placeholder="Enter your password again."
            />
            <FormErrorHandler error={errors.password2} />
          </div>

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
