import React from "react"
import { connect } from "react-redux"
import { throttle } from "lodash"

import Modal from "./Modal"
import { RecipeItem as Recipe } from "./RecipeItem"
import { searchRecipes, Dispatch } from "store/actions"
import { classNames } from "classnames"
import { RootState } from "store/store"
import { IRecipe } from "store/reducers/recipes"

const SEARCH_THROTTLE_MS = 100

interface ISearchModalProps {
  readonly searchResults: IRecipe[]
  readonly loading: boolean
  readonly search: (query: string) => void
}

interface ISearchModalState {
  readonly query: string
  readonly show: boolean
}

class SearchModal extends React.Component<
  ISearchModalProps,
  ISearchModalState
> {
  inputRef = React.createRef<HTMLInputElement>()
  search: (query: string) => void

  constructor(props: ISearchModalProps) {
    super(props)
    this.search = throttle(this.props.search, SEARCH_THROTTLE_MS)
  }

  state = {
    query: "",
    show: false
  }

  handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    this.setState({ query: event.target.value })
  }

  handleSearch = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "Enter") {
      this.search(this.state.query)
    }
  }

  handleKeyPress = (event: KeyboardEvent) => {
    const el = document.activeElement
    if (el && el.tagName !== "BODY") {
      return
    }
    const pressF = event.key === "f" && !event.ctrlKey && !event.metaKey
    if (pressF) {
      this.setState({ show: true }, () => {
        const refEl = this.inputRef.current
        if (refEl) {
          refEl.focus()
        }
      })
    }
  }

  componentWillMount() {
    document.addEventListener("keyup", this.handleKeyPress)
  }

  componentWillUnmount() {
    document.removeEventListener("keyup", this.handleKeyPress)
  }

  componentDidUpdate(
    _prevProps: ISearchModalProps,
    prevState: ISearchModalState
  ) {
    if (prevState.query !== this.state.query) {
      this.search(this.state.query)
    }
  }

  render() {
    const { searchResults, loading } = this.props
    const content =
      searchResults.length > 0 ? (
        searchResults.map(x => <Recipe key={x.id} {...x} />)
      ) : (
        <p className="text-muted">
          Search all recipes (ingredients, steps, and metadata).
        </p>
      )
    return (
      <Modal
        show={this.state.show}
        className="search--position-top"
        onClose={() => this.setState({ show: false })}>
        <div className={classNames("control", { "is-loading": loading })}>
          <input
            value={this.state.query}
            onChange={this.handleInputChange}
            className="input mb-4"
            type="text"
            ref={this.inputRef}
            placeholder="Search Recipes..."
            onKeyDown={this.handleSearch}
          />
        </div>
        <div className="search--results">{content}</div>
      </Modal>
    )
  }
}

const mapStateToProps = (state: RootState) => ({
  searchResults: state.search.results,
  loading: state.search.loading > 0
})

const mapDispatchToProps = (dispatch: Dispatch) => {
  return {
    search: searchRecipes(dispatch)
  }
}

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(SearchModal)
