import React from 'react'
import { connect } from 'react-redux'
import { throttle } from 'lodash'

import Modal from './Modal'
import { RecipeItem as Recipe } from './RecipeItem'
import { searchRecipes } from '../store/actions'
import { classNames } from '../classnames'

const SEARCH_THROTTLE_MS = 100

class SearchModal extends React.Component {

  constructor (props) {
    super(props)
    this.inputRef = React.createRef()
    this.search = throttle(this.props.search, SEARCH_THROTTLE_MS)
  }

  state = {
    query: '',
    show: false,
  }

  handleInputChange = (event) => {
    this.setState({ query: event.target.value })
  }

  handleSearch = (event) => {
    if (event.key === 'Enter') {
      this.search(this.state.query)
    }
  }

  handleKeyPress = (event) => {
    if (document.activeElement.tagName !== 'BODY') return
    const pressF = event.key === 'f' && !event.ctrlKey && !event.meta
    if (pressF) {
      this.setState({ show: true })
      this.inputRef.current.focus()
    }
  }

  componentWillMount () {
    document.addEventListener('keyup', this.handleKeyPress)
  }

  componentWillUnmount () {
    document.removeEventListener('keyup', this.handleKeyPress)
  }

  componentDidUpdate (_prevProps, prevState) {
    if (prevState.query !== this.state.query) {
      this.search(this.state.query)
    }
  }

  render () {
    const { searchResults, loading } = this.props
    let content = <p className="text-muted">Search all recipes (ingredients, steps, and metadata).</p>
    if (searchResults.length > 0) {
      content = searchResults.map(x => <Recipe key={x.id} {...x}/>)
    }
    return <Modal show={this.state.show} className="search--position-top" onClose={() => this.setState({ show: false })}>
      <div className={classNames('control', { 'is-loading': loading })}>
        <input
          value={this.state.query}
          onChange={this.handleInputChange}
          className="input mb-4"
          type="text"
          ref={this.inputRef}
          placeholder="Search Recipes..."
          onKeyDown={this.handleSearch}/>
      </div>
      <div className="search--results">
        { content }
      </div>
    </Modal>
  }
}

const mapStateToProps = state => ({
  searchResults: state.search.results,
  loading: state.search.loading,
})

const mapDispatchToProps = dispatch => {
  return {
    search: (query) => {
      dispatch(searchRecipes(query))
    },
  }
}

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(SearchModal)
