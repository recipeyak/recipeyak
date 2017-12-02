import { connect } from 'react-redux'

import Home from '../components/Home.jsx'

import { fetchUser, fetchUserStats } from '../store/actions'

const mapStateToProps = state => {
  return {
    loggedIn: state.user.token != null,
    userStats: state.user.stats,
    loadingUserStats: state.user.stats_loading
  }
}

const mapDispatchToProps = dispatch => {
  return {
    fetchData: () => {
      dispatch(fetchUser())
      dispatch(fetchUserStats())
    }
  }
}

const ConnectedHome = connect(
  mapStateToProps,
  mapDispatchToProps
)(Home)

export default ConnectedHome
