import React from 'react'

class HomeSignup extends React.Component {
  state = {
    email: '',
    password1: '',
    password2: ''
  }

  handleInputChange = e => {
    this.setState({ [e.target.name]: e.target.value })
  }

  handleSubmit = async e => {
    e.preventDefault()
    const { email, password1, password2 } = this.state
    this.setState({ loading: true })
    console.log(email)
    await this.props.signup(email, password1, password2)
    this.setState({ loading: false })
  }

  render () {
    const { handleSubmit, handleInputChange } = this
    const { loading } = this.state
    const { error } = this.props
    return (
      <div className="align-self-center">
        <h2 className="fw-bold fs-2rem">Sign Up</h2>

        { this.state.error ? <p>Erorr</p> : '' }
        <form onSubmit={ handleSubmit }>
          <div className="field">
            <label className="label">Email</label>
            <p className="control">
              <input
                onChange={ handleInputChange }
                className='input'
                autoFocus
                name="email"
                type="email"
                placeholder="rick.sanchez@me.com"
                required/>
              { error.email.map(x => <span className="fs-italic fw-bold" key={x}>{x}</span>) }
            </p>
          </div>

          <div className="field">
            <label htmlFor="password1" className="label">Password</label>
            <p className="control">
              <input
                onChange={ handleInputChange }
                className='input'
                type="password"
                name="password1"
                id="password1"
                placeholder="Super secret password."
                required/>
              { error.password1.map(x => <span className="fs-italic fw-bold" key={x}>{x}</span>) }
            </p>
          </div>

          <div className="field">
            <label htmlFor="password2" className="label">Password Again</label>
            <p className="control">
              <input
                onChange={ handleInputChange }
                className='input'
                type="password"
                name="password2"
                id="password2"
                placeholder="Enter your password again."
                required/>
              { error.password2.map(x => <span className="fs-italic fw-bold" key={x}>{x}</span>) }

              { error.nonFieldErrors.map(x => <span className="fs-italic fw-bold" key={x}>{x}</span>) }
            </p>
          </div>

          <div className="field flex-space-between">
            <p className="control">
              <button
                type="submit"
                className={ 'button is-primary ' + (loading ? 'is-loading' : '') }>
                Create Account
              </button>
            </p>
          </div>

        </form>
      </div>
    )
  }
}

export default HomeSignup
