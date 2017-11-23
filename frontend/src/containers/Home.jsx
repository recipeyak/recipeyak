import { connect } from 'react-redux'

import Home from '../components/Home.jsx'

import { fetchUser } from '../store/actions'

const mapStateToProps = state => {
  return {
    loggedIn: state.user.token != null
  }
}

const mapDispatchToProps = dispatch => {
  return {
    fetchData: () => {
      dispatch(fetchUser())
    }
  }
}

const ConnectedHome = connect(
  mapStateToProps,
  mapDispatchToProps
)(Home)

export default ConnectedHome
