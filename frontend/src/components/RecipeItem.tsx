import * as React from 'react'
import { Link } from 'react-router-dom'

import { ButtonPrimary } from './Buttons'

import { inputAbs } from '../input'

import { Recipe as IRecipe } from '../store/reducers/recipes'

import {
  recipeURL,
  teamURL,
} from '../urls'

interface IRecipeItemState {
  count: number
}

class RecipeItem extends React.Component<IRecipe, IRecipeItemState> {
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
    this.setState({ [e.target.name]: inputAbs(e.target.value) })

  render () {
    const {
      tags = {},
      name,
      author,
      id,
      url = recipeURL(id, name),
      cart_count,
      removeFromCart,
      removingFromCart = false,
      addToCart,
      addingToCart = false,
      owner = {
        type: 'user',
        id: 0,
        name: '',
      },
      updateCart
    } = this.props

    const spanTags = tags.length > 0
      ? tags.map(tag => <span key={ tag } className="tag is-medium">{ tag }</span>)
      : null

    const ownershipDetail = owner.type === 'team' && owner.name && owner.id
      ? <div className=" text-muted fw-500">
          via <Link to={teamURL(owner.id)} className="text-muted bold">{ owner.name }</Link>
        </div>
      : ''

    const buttons = (
      <div className="field is-grouped">
        <button
          onClick={ () => removeFromCart(id) }
          className={ `my-button control ${removingFromCart ? 'is-loading' : ''}` }
          disabled={ !cart_count }>Remove One</button>
          <ButtonPrimary
            className='control'
            onClick={ () => addToCart(id) }
            loading={ addingToCart }>
            Add Another
          </ButtonPrimary>
          <div className="max-width-10">
          <input
            onChange={ this.handleInputChange }
            onBlur={
              () => {
                const changed = this.state.count.toString() !== cart_count.toString()
                if (changed) {
                  updateCart(id, this.state.count)
                }
              }
            }
            disabled={ addingToCart || removingFromCart }
            value={ this.state.count }
            name="count"
            className="bg-whitesmoke text-center is-light my-input is-slim"/>
        </div>
      </div>
    )

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
            { ownershipDetail }
          </div>

        </div>
        <footer className="card-footer">
          <div className="card-footer-item">{ buttons }</div>
        </footer>
      </div>
    )
  }
}

export default RecipeItem
