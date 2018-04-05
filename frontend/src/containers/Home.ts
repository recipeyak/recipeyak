import { connect, Dispatch } from 'react-redux'
import { StateTree } from '../store/store'

import Home from '../components/Home'

import { fetchUser } from '../store/actions'

const mapStateToProps = (state: StateTree) => ({
  loggedIn: state.user.token != null
})

const mapDispatchToProps = (dispatch: Dispatch<StateTree>) => ({
  fetchData: () => dispatch(fetchUser())
})

const ConnectedHome = connect<{},{},{}>(
  mapStateToProps,
  mapDispatchToProps
)(Home)

export default ConnectedHome
