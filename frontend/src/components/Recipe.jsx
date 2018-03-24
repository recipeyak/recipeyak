import React from 'react'
import { Helmet } from 'react-helmet'
import { Link } from 'react-router-dom'
import { connect } from 'react-redux'

import Loader from './Loader'
import RecipeEdit from '../containers/RecipeEdit'
import NoMatch from './NoMatch'
import { ButtonPrimary, ButtonLink } from './Buttons'

import { inputAbs } from '../input'
import { teamURL } from '../urls'

import {
  fetchTeams,
  moveRecipeTo,
  copyRecipeTo,
  showNotificationWithTimeout,
} from '../store/actions'

// TODO: Create a generalized component with the click event listeners
// we seems to use this functionality a lot
class Owner extends React.Component {
  state = {
    show: false,
    values: [],
  }
  componentWillMount () {
    document.addEventListener('click', this.handleGeneralClick)
    this.props.fetchData()
  }

  componentWillUnmount () {
    document.removeEventListener('click', this.handleGeneralClick)
  }

  handleGeneralClick = e => {
    const clickedDropdown = this.dropdown && this.dropdown.contains(e.target)
    if (clickedDropdown) return
    // clear values when closing dropdown
    this.setState({ show: false, values: [] })
  }

  handleChange = e => {
    // convert HTMLCollection to list of option values
    const selectedOptions = [...e.target.selectedOptions]
      .map(e => e.value)
    this.setState({ values: selectedOptions })
  }

  toggle () {
    this.setState(prev => {
      if (prev.show) {
        // clear values when closing dropdown
        return { show: !prev.show, values: [] }
      }
      return { show: !prev.show }
    })
  }

  copy () {
    const [id, type] = this.state.values[0].split('-')
    if (id == null || type == null) { throw new TypeError('need id/type to move to') }
    this.props.copyRecipeTo(this.props.recipeId, id, type)
      .then(() => this.setState({ show: false, values: [] }))
      .catch(err => this.props.showNotificationWithTimeout({ message: `Problem copying recipe: ${err}`, level: 'danger', sticky: true }))
  }

  move () {
    const [id, type] = this.state.values[0].split('-')
    if (id == null || type == null) { throw new TypeError('need id/type to copy to') }
    this.props.moveRecipeTo(this.props.recipeId, id, type)
      .then(() => this.setState({ show: false, values: [] }))
      .catch(err => this.props.showNotificationWithTimeout({ message: `Problem moving recipe: ${err}`, level: 'danger', sticky: true }))
  }

  disableMove () {
    return this.state.values.length !== 1
  }

  disableCopy () {
    return this.state.values.length !== 1
  }

  render () {
    const { type, url, name, teams, userId } = this.props
    const { moving, copying } = teams
    const teamUserKeys = [
      ...teams.allIds.map(id => ({ id: id + '-team', name: teams[id].name })),
      { id: userId + '-user', name: 'personal' }
    ]

    return (
      <span className="fw-500" ref={dropdown => { this.dropdown = dropdown }}>
        <b>via</b> { type === 'user' ? 'you' : <Link to={url}>{ name }</Link> }
        <div className={(this.state.show ? 'dropdown is-active' : 'dropdown')}>
          <div className='dropdown-trigger'>
            <ButtonLink className='is-small ml-1' onClick={ () => this.toggle() }>Move/Copy</ButtonLink>
          </div>
          <div className='dropdown-menu'>
            <div className='dropdown-content'>
              <div className='text-center'>Teams</div>
              <hr className='dropdown-divider mt-1 mb-1'/>
              <div className='max-height-25vh overflow-y-scroll select is-multiple w-100'>
                <select multiple={true} className="my-select" value={this.state.values} onChange={this.handleChange}>
                  { teamUserKeys.map(({ id, name }) => (
                    <option className="fs-3 fw-500" key={id} value={id}>{name}</option>))}
                </select>
              </div>
              <hr className='dropdown-divider'/>
              <div className='d-flex justify-space-between ml-2 mr-2'>
                <button className='button is-small is-link' onClick={ () => this.toggle() }>cancel</button>
                <div className="d-flex justify-space-between">
                  <button
                    className={'button is-small is-secondary mr-1' + (moving ? ' is-loading' : '')}
                    onClick={ () => this.move() }
                    disabled={this.disableMove()}>move</button>
                  <button
                    className={'button is-small is-primary' + (copying ? ' is-loading' : '')}
                    onClick={ () => this.copy()}
                    disabled={this.disableCopy()}>copy</button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </span>
    )
  }
}

const mapStateToProps = state => ({
  teams: state.teams,
  userId: state.user.id,
})

const mapDispatchToProps = dispatch => ({
  fetchData: () => dispatch(fetchTeams()),
  showNotificationWithTimeout: options => dispatch(showNotificationWithTimeout(options)),
  moveRecipeTo: (recipeId, ownerId, type) => dispatch(moveRecipeTo(recipeId, ownerId, type)),
  copyRecipeTo: (recipeId, ownerId, type) => dispatch(copyRecipeTo(recipeId, ownerId, type)),
})

const ConnectedOwner = connect(
  mapStateToProps,
  mapDispatchToProps
)(Owner)

const MetaData = ({
  author = '',
  source = '',
  servings = '',
  time = '',
  owner,
  recipeId,
}) => {
  const isValid = x => x !== '' && x != null

  const _author = isValid(author)
    ? <span>By <b>{author}</b> </span>
    : null
  const _source = isValid(source)
    ? <span>from <b>{source}</b> </span>
    : null
  const _servings = isValid(servings)
    ? <span>creating <b>{servings}</b> </span>
    : null
  const _time = isValid(time)
    ? <span>in <b>{time}</b> </span>
    : null

  return <div className="break-word">
    <span>{ _author }{ _source }{ _servings }{ _time }</span>
    <ConnectedOwner type={owner.type} url={teamURL(owner.id)} name={owner.name} recipeId={recipeId}/>
  </div>
}

/* eslint-disable camelcase */
const RecipeViewing = ({
  id,
  name,
  author,
  source,
  servings,
  time,
  ingredients = [],
  steps = [],
  cart_count = 0,
  addToCart,
  removeFromCart,
  updateCart,
  addingToCart = false,
  removingFromCart = false,
  loading = true,
  error404 = false,
  edit,
  count,
  handleInputChange,
  owner = {
    type: 'user',
    id: 0,
    name: '',
  },
}) => {
  if (error404) {
    return <NoMatch/>
  }
  if (loading) {
    return <section className="d-flex justify-content-center">
      <Loader/>
    </section>
  }
  return (
    <div className="d-grid grid-gap-2">
      <Helmet title={ name }/>

      <div className="grid-entire-row d-flex align-center justify-space-between flex-wrap">
        <h1 className="title fs-3rem mb-0">{ name }</h1>
        <div className="d-flex">
          <input
            onClick={ () => removeFromCart(id) }
            className={ `my-button ${removingFromCart ? 'is-loading' : ''}` }
            disabled={ cart_count <= 0 }
            type="button"
            value="-"/>
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
            className="bg-whitesmoke text-center is-light my-input is-slim max-width-10 mr-1 ml-1"/>
          <ButtonPrimary
            onClick={ () => addToCart(id) }
            loading={ addingToCart }
            type="button"
            value="+">
            +
          </ButtonPrimary>
        </div>
      </div>

      <div className="grid-entire-row">
        <MetaData
          owner={owner}
          name={name}
          author={author}
          source={source}
          servings={servings}
          recipeId={id}
          time={time}/>
      </div>

      <section className="ingredients-preparation-grid">
        <div>
          <h2 className="title is-3 mb-1 font-family-title bold">Ingredients</h2>
          <ul>
            {
              ingredients.map(({ id, quantity, name, description }) =>
                <p key={ id } className="listitem-text justify-space-between">
                  { quantity } { name } { description }
                </p>
              )
            }
          </ul>
        </div>

        <div>
          <h2 className="title is-3 mb-1 font-family-title bold">Preparation</h2>
          <ul>
            {
              steps.map(({ id, text }, i) =>
              <div key={id}>
                <label className="better-label">Step { i + 1}</label>
                <p className="listitem-text mb-2">{ text }</p>
              </div>

              )
            }
          </ul>
        </div>
      </section>

      <section className="d-flex justify-content-end grid-entire-row">
        <button
          onClick={ edit }
          className="my-button is-link">
          Edit
        </button>
      </section>
    </div>
  )
}
/* eslint-enable camelcase */

class Recipe extends React.Component {
  constructor (props) {
    super(props)
    this.state = {
      editing: false,
      count: this.props.cart_count,
      loading: true,
    }
  }

  componentWillReceiveProps = nextProps => {
    this.setState({ count: nextProps.cart_count })
  }

  handleInputChange = e =>
    this.setState({ [e.target.name]: inputAbs(e.target.value) })

  componentWillMount = async () => {
    await this.props.fetchRecipe(this.props.match.params.id)
    this.setState({ loading: false })
  }

  render () {
    if (this.state.loading) return <p>Loading...</p>

    if (this.state.editing) {
      return (
        <RecipeEdit
          { ...this.props }
          cancelEdit={ () => this.setState({ editing: false }) }
        />
      )
    }
    return (
      <RecipeViewing
        { ...this.props }
        { ...this.state }
        handleInputChange={ this.handleInputChange }
        edit={ () => this.setState({ editing: true }) }
      />
    )
  }
}

export default Recipe
