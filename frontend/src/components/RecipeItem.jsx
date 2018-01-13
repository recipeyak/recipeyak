import React from 'react'
import { Link } from 'react-router-dom'

const toURL = (x = '') => x.replace(/\s/g, '-')

export const recipeURL = (id, name) => `/recipes/${id}-${toURL(name)}`

const RecipeItem = ({
    tags = {},
    url,
    source,
    name,
    author,
    id,
    cart_count,
    removeFromCart,
    removingFromCart = false,
    addToCart,
    addingToCart = false,
    handleInputChange,
    count,
    updateCart
  }) => {
  const spanTags = tags.length > 0
    ? tags.map(tag => <span key={ tag } className="tag is-medium">{ tag }</span>)
    : null
  const buttons = (
    <div className="field is-grouped">

      {/* eslint-disable camelcase */}
      <button
        onClick={ () => removeFromCart(id) }
        className={ `my-button control ${removingFromCart ? 'is-loading' : ''}` }
        disabled={ !cart_count }>Remove One</button>
      {/* eslint-enable camelcase */}
      <button
        onClick={ () => addToCart(id) }
        className={ `my-button is-primary control ${addingToCart ? 'is-loading' : ''}` }
        >Add Another</button>
        <div className="max-width-10">
        <input
          onChange={ handleInputChange }
          onBlur={
            () => {
              const changed = count.toString() !== cart_count.toString()
              if (changed) {
                updateCart(id, count)
              }
            }
          }
          disabled={ addingToCart || removingFromCart }
          value={ count }
          name="count"
          className="bg-whitesmoke text-center is-light my-input is-slim"/>
      </div>
    </div>
  )

  if (url == null) {
    url = recipeURL(id, name)
  }

  return (
    <div className="card ">
      <div className="card-content">
        <p className="title">
          <Link to={ url }>{ name }</Link>
        </p>
        <p className="subtitle">
          { author }
        </p>
        <div className="content">
          { spanTags }
        </div>

      </div>
      <footer className="card-footer">
        <div className="card-footer-item">{ buttons }</div>
      </footer>
    </div>
  )
}

class RecipeItemContainer extends React.Component {
  constructor (props) {
    super(props)
    this.state = {
      count: this.props.cart_count
    }
  }

  componentWillReceiveProps = nextProps => {
    this.setState({ count: nextProps.cart_count })
  }

  handleInputChange = e =>
    this.setState({ [e.target.name]: e.target.value })

  render () {
    return <RecipeItem
      {...this.props}
      handleInputChange={ this.handleInputChange }
      count={ this.state.count }
    />
  }
}

export default RecipeItemContainer
