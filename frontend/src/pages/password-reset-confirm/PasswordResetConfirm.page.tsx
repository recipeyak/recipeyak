import React from "react"
import { connect } from "react-redux"
import type { RouteComponentProps } from "react-router-dom"
import { Link } from "react-router-dom"

import { ButtonPrimary } from "@/components/Buttons"
import { FormErrorHandler, PasswordInput } from "@/components/Forms"
import { Helmet } from "@/components/Helmet"
import type { IPasswordResetConfirmError } from "@/store/reducers/auth"
import type { IState } from "@/store/store"
import type { Dispatch } from "@/store/thunks"
import { resetConfirmationAsync as reset } from "@/store/thunks"

type RouteProps = RouteComponentProps<{ uid: string; token: string }>

const mapStateToProps = (state: IState, props: RouteProps) => {
  const uid = props.match.params.uid
  const token = props.match.params.token
  return {
    uid,
    token,
    loading: state.auth.loadingResetConfirmation,
    error: state.auth.errorResetConfirmation,
  }
}

const mapDispatchToProps = (dispatch: Dispatch) => ({
  reset: reset(dispatch),
})

interface IPasswordResetConfirmationProps {
  readonly reset: (
    uid: string,
    token: string,
    newPassword1: string,
    newPassword2: string,
  ) => Promise<void>
  readonly uid: string
  readonly token: string
  readonly loading: boolean
  readonly error: IPasswordResetConfirmError
}

interface IPasswordResetConfirmationState {
  readonly newPassword1: string
  readonly newPassword2: string
}

class PasswordResetConfirmation extends React.Component<
  IPasswordResetConfirmationProps,
  IPasswordResetConfirmationState
> {
  state = {
    newPassword1: "",
    newPassword2: "",
  }

  handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    /* eslint-disable @typescript-eslint/consistent-type-assertions */
    this.setState({
      [e.target.name]: e.target.value,
    } as unknown as IPasswordResetConfirmationState)
    /* eslint-enable @typescript-eslint/consistent-type-assertions */
  }

  handleReset = async (e: React.FormEvent) => {
    e.preventDefault()
    await this.props.reset(
      this.props.uid,
      this.props.token,
      this.state.newPassword1,
      this.state.newPassword2,
    )
    this.setState({
      newPassword1: "",
      newPassword2: "",
    })
  }

  render() {
    const { nonFieldErrors, newPassword1, newPassword2 } = this.props.error

    return (
      <section className="section">
        <Helmet title="Password Reset" />
        <div className="container">
          <div className="columns">
            <div className="column is-half-tablet is-offset-one-quarter-tablet is-one-third-desktop is-offset-one-third-desktop box">
              <form onSubmit={this.handleReset}>
                <h1 className="title is-5">Password Reset Confirmation</h1>

                <FormErrorHandler error={nonFieldErrors} />

                <div className="field">
                  <label className="label">Password</label>
                  <p className="control">
                    <PasswordInput
                      autoFocus
                      onChange={this.handleInputChange}
                      error={newPassword1 != null}
                      name="newPassword1"
                      value={this.state.newPassword1}
                    />
                  </p>
                  <FormErrorHandler error={newPassword1} />
                </div>

                <div className="field">
                  <label className="label">Password Again</label>
                  <p className="control">
                    <PasswordInput
                      onChange={this.handleInputChange}
                      error={newPassword2 != null}
                      name="newPassword2"
                      value={this.state.newPassword2}
                    />
                  </p>
                  <FormErrorHandler error={newPassword2} />
                </div>

                <div className="field d-flex flex-space-between">
                  <p className="control">
                    <ButtonPrimary loading={this.props.loading} type="submit">
                      Change Password
                    </ButtonPrimary>
                  </p>

                  <Link to="/login" className="my-button is-link">
                    To Login
                  </Link>
                </div>
              </form>
            </div>
          </div>
        </div>
      </section>
    )
  }
}

export default connect(
  mapStateToProps,
  mapDispatchToProps,
)(PasswordResetConfirmation)
