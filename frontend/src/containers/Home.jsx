import { connect } from 'react-redux'

import Home from '../components/Home'

import { fetchUser } from '../store/actions'

const mapStateToProps = state => ({
  loggedIn: state.user.loggedIn
})

const mapDispatchToProps = dispatch => ({
  fetchData: () => dispatch(fetchUser())
})

const ConnectedHome = connect(
  mapStateToProps,
  mapDispatchToProps
)(Home)

export default ConnectedHome
