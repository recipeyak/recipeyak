import { AxiosError } from "axios"
import { Location } from "history"
import React from "react"
import { useDispatch } from "react-redux"
import { Link, useHistory, useLocation } from "react-router-dom"

import AuthContainer from "@/components/AuthContainer"
import { Button } from "@/components/Buttons"
import { FormErrorHandler, PasswordInput, TextInput } from "@/components/Forms"
import { Helmet } from "@/components/Helmet"
import { useAuthLogin } from "@/queries/authLogin"
import { cacheUserInfo } from "@/store/reducers/user"

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

export default function Login() {
  const [email, setEmail] = React.useState("")
  const [password, setPassword] = React.useState("")
  const history = useHistory()
  const location = useLocation<{ from: Location } | undefined>()
  const dispatch = useDispatch()
  const authLogin = useAuthLogin()

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    authLogin.mutate(
      { email, password },
      {
        onSuccess: (res) => {
          // TODO: move this stuff into react-query or something
          dispatch(cacheUserInfo(res.user))
          history.push(location.state?.from ?? {})
        },
      },
    )
  }

  const errors = formatError(authLogin.error)

  return (
    <AuthContainer>
      <div className="box p-3">
        <Helmet title="Login" />
        <div className="tabs is-boxed mb-2">
          <ul>
            <li className="is-active">
              <Link to="/login">Login</Link>
            </li>
            <li>
              <Link to="/signup">Sign Up</Link>
            </li>
          </ul>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="field">
            <label className="label">Email</label>
            <TextInput
              onChange={(e) => {
                setEmail(e.target.value)
              }}
              value={email}
              error={errors?.email != null}
              autoFocus
              name="email"
              placeholder="rick.sanchez@me.com"
            />
            <FormErrorHandler error={errors?.email} />
          </div>

          <div className="field">
            <label htmlFor="password" className="label">
              Password
            </label>
            <PasswordInput
              onChange={(e) => {
                setPassword(e.target.value)
              }}
              value={password}
              error={errors?.password != null}
              name="password"
              placeholder="Super secret password."
            />
            <FormErrorHandler error={errors?.password} />
            <FormErrorHandler error={errors?.nonFieldErrors} />
          </div>

          <div className="field d-flex flex-space-between align-items-center">
            <Button
              variant="primary"
              type="submit"
              loading={authLogin.isLoading}
            >
              Submit
            </Button>
            <Link to="/password-reset">Forgot Password?</Link>
          </div>
        </form>
      </div>
    </AuthContainer>
  )
}
