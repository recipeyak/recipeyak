import React from 'react'
import { Button, ButtonPrimary } from './Buttons'
import MetaData from './MetaData'
import DatePickerForm from './DatePickerForm'
import PropTypes from 'prop-types'

export default class RecipeTitle extends React.Component {
  state = {
    show: false,
    edit: false,
    recipe: {

    }
  }

  static propTypes = {
    id: PropTypes.number.isRequired,
    name: PropTypes.string.isRequired,
    author: PropTypes.string.isRequired,
    source: PropTypes.string.isRequired,
    servings: PropTypes.string.isRequired,
    time: PropTypes.string.isRequired,
    owner: PropTypes.object.isRequired,
    update: PropTypes.func.isRequired,
    updating: PropTypes.bool.isRequired,
    remove: PropTypes.func.isRequired,
    deleting: PropTypes.bool.isRequired,
    lastScheduled: PropTypes.string,
  }

  toggleEdit = () => this.setState(prev => ({ edit: !prev.edit }))

  handleSave = () => {
    const data = this.state.recipe
    this.props.update(this.props.id, data).then(() => {
      this.setState({ edit: false })
    })
  }

  handleInputChange = e => {
    e.persist()
    this.setState(prevState => ({
      recipe: {
        ...prevState.recipe,
        [e.target.name]: e.target.value
      }
    }))
  }

  handleDelete = () => {
    if (confirm(`Are you sure you want to delete this recipe "${this.props.name}"?`)) {
      this.props.remove(this.props.id)
    }
  }

  render () {
    const {
      id,
      name,
      author,
      source,
      servings,
      time,
      owner = {
        type: 'user',
        id: 0,
        name: '',
      },
      updating,
      deleting,
      lastScheduled,
    } = this.props
    return (
      <div>
        <div className="grid-entire-row d-flex justify-space-between p-rel">
          { !this.state.edit
              ? <div className="d-flex align-items-center">
                    <h1 className="title fs-3rem mb-0 cursor-pointer" onClick={this.toggleEdit}>{ name }</h1>
                  </div>
            : <input
                  className="my-input fs-2rem mb-4"
                  type="text"
                  autoFocus
                  placeholder="new recipe title"
                  onChange={ this.handleInputChange }
                  defaultValue={ name }
                  name="name"/>
                }
                <div>
          <div className="p-rel ml-4">
            <ButtonPrimary onClick={() => this.setState(prev => ({ show: !prev.show }))} className="is-small">
              schedule
            </ButtonPrimary>
            <DatePickerForm
              recipeID={id}
              show={this.state.show}
              close={() => this.setState({ show: false })}
            />
          </div>
          </div>
        </div>

        { !this.state.edit
      ? <div className="grid-entire-row">
        <MetaData
          onClick={this.toggleEdit}
          owner={owner}
          name={name}
          author={author}
          source={source}
          servings={servings}
          recipeId={id}
          lastScheduled={lastScheduled}
          time={time}/>
      </div>

            : <div className="d-grid grid-entire-row align-items-center meta-data-grid">
      <div className="d-grid grid-entire-row align-items-center meta-data-grid">
        <label className="d-flex align-center">By
          <input
            className="my-input ml-2"
            type="text"
            placeholder="Author"
            defaultValue={ author }
            onChange={ this.handleInputChange }
            name="author"/>
        </label>
        <label className="d-flex align-center">from
          <input
            className="my-input ml-2"
            type="text"
            placeholder="http://example.com/dumpling-soup"
            defaultValue={ source }
            onChange={ this.handleInputChange }
            name="source"/>
        </label>
        <label className="d-flex align-center">creating
          <input
            className="my-input ml-2"
            type="text"
            placeholder="4 to 6 servings"
            defaultValue={ servings }
            onChange={ this.handleInputChange }
            name="servings"/>
        </label>
        <label className="d-flex align-center">in
          <input
            className="my-input ml-2"
            type="text"
            placeholder="1 hour"
            defaultValue={ time }
            onChange={ this.handleInputChange }
            name="time"/>
        </label>

      </div>
      <div className="d-flex grid-entire-row align-items-center justify-space-between">

        <Button
          className="is-small"
          type="submit"
          loading={deleting}
          onClick={this.handleDelete}
          name="delete recipe" >
          Delete
        </Button>
        <div>
        <Button
          className="is-small ml-2"
          type="submit"
          loading={updating}
          onClick={this.handleSave}
          name="save recipe" >
          Save
        </Button>
        <input
          className='my-button is-small ml-2'
          type="button"
          name="cancel recipe update"
          onClick={this.toggleEdit}
          value="Cancel"/>
      </div>
      </div>
      </div>
        }
      </div>
    )
  }
}
