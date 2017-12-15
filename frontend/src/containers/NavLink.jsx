import { connect } from 'react-redux'

import { push } from 'react-router-redux'

import { NavLink } from '../components/NavLink.jsx'

const mapStateToProps = state => {
  return {
    pathname: state.routerReducer.location != null
      ? state.routerReducer.location.pathname
      : ''
  }
}

const mapDispatchToProps = dispatch => {
  return {
    navigateTo: location => {
      dispatch(push(location))
    }
  }
}

const ConnectedNavLink = connect(
  mapStateToProps,
  mapDispatchToProps
)(NavLink)

export default ConnectedNavLink
