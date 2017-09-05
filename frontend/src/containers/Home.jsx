import { connect } from 'react-redux'

import Home from '../Home.jsx'

const mapStateToProps = state => {
  return {
    loggedIn: state.user.token != null,
  }
}

const ConnectedHome = connect(
  mapStateToProps,
)(Home)

export default ConnectedHome
