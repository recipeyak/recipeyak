import React from "react"
import { Helmet } from "./Helmet"
import { Link } from "react-router-dom"

import { FormErrorHandler } from "./Forms"
import { ButtonPrimary } from "./Buttons"
import AuthContainer from "./AuthContainer"

class PasswordReset extends React.Component {
  state = {
    email: ""
  }

  handleInputChange = e => {
    this.setState({ [e.target.name]: e.target.value })
  }

  async handleReset(e) {
    e.preventDefault()
    await this.props.reset(this.state.email)
    this.setState({ email: "" })
  }

  render() {
    const { nonFieldErrors, email } = this.props.error

    const redirect = this.props.loggedIn
      ? { name: "Home", route: "/" }
      : { name: "Login", route: "/login" }

    return (
      <AuthContainer>
        <Helmet title="Password Reset" />
        <form className="box p-3" onSubmit={e => this.handleReset(e)}>
          <h1 className="title is-5 mb-2 fw-500">Password Reset</h1>

          <FormErrorHandler error={nonFieldErrors} />

          <div className="field">
            <label className="label">Email</label>
            <input
              autoFocus
              onChange={this.handleInputChange}
              className={"my-input" + (email ? " is-danger" : "")}
              type="email"
              name="email"
              value={this.state.email}
              required
              placeholder="rick.sanchez@me.com"
            />
            <FormErrorHandler error={email} />
          </div>

          <div className="field d-flex flex-space-between align-items-center">
            <ButtonPrimary loading={this.props.loading} type="submit">
              Send Reset Email
            </ButtonPrimary>

            <Link to={redirect.route}>{redirect.name} →</Link>
          </div>
        </form>
      </AuthContainer>
    )
  }
}

export default PasswordReset
