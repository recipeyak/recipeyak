import React from "react"
import { Link, useHistory, useLocation } from "react-router-dom"
import { Helmet } from "@/components/Helmet"
import { FormErrorHandler, TextInput, PasswordInput } from "@/components/Forms"
import { ButtonPrimary } from "@/components/Buttons"
import * as api from "@/api"
import AuthContainer from "@/components/AuthContainer"
import { login } from "@/store/reducers/auth"
import { isOk } from "@/result"
import { useDispatch } from "react-redux"
import { clearNotification } from "@/store/reducers/notification"
import { Location } from "history"

export default function Login() {
  const [loading, setLoading] = React.useState(false)
  const [email, setEmail] = React.useState("")
  const [password, setPassword] = React.useState("")
  const [errors, setErrors] = React.useState<{
    email?: string[]
    password?: string[]
    nonFieldErrors?: string[]
  }>()
  const history = useHistory()
  const location = useLocation<{ from: Location } | undefined>()
  const dispatch = useDispatch()

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    dispatch(clearNotification())
    setLoading(true)
    setErrors(undefined)
    void api.loginUser(email, password).then((res) => {
      if (isOk(res)) {
        dispatch(login.success(res.data.user))
        setLoading(false)
        history.push(location.state?.from ?? {})
      } else {
        const err = res.error
        if (err?.response?.status === 400) {
          const data: {
            email?: string[]
            password1?: string[]
            non_field_errors?: string[]
          } = err.response.data
          setErrors({
            email: data.email,
            password: data.password1,
            nonFieldErrors: data.non_field_errors,
          })
        } else {
          setErrors({
            nonFieldErrors: ["Something went wrong with the server."],
          })
        }
        setLoading(false)
      }
    })
  }

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
              onChange={(e) => setEmail(e.target.value)}
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
              onChange={(e) => setPassword(e.target.value)}
              value={password}
              error={errors?.password != null}
              name="password"
              placeholder="Super secret password."
            />
            <FormErrorHandler error={errors?.password} />
            <FormErrorHandler error={errors?.nonFieldErrors} />
          </div>

          <div className="field d-flex flex-space-between align-items-center">
            <ButtonPrimary type="submit" loading={loading}>
              Submit
            </ButtonPrimary>
            <Link to="/password-reset">Forgot Password?</Link>
          </div>
        </form>
      </div>
    </AuthContainer>
  )
}
