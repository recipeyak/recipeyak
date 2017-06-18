import React from 'react'
import { Link } from 'react-router-dom'

import './index.scss'

import Textarea from 'react-textarea-autosize'

import MarkdownIt from 'markdown-it'
const md = new MarkdownIt()

class Recipe extends React.Component {
  constructor () {
    super()
    const ingredients = `- 1 cup of water
- 1 teaspoon
- 1 garlic clove`

    const steps = `1. Mix dry ingredients
2. Mix wet ingredients
3. Combine wet and dry ingredients
4. Bake at 400°F for 1 hour`

    const time = '1 Hour'

    this.state = {
      editing: false,
      name: 'Miso Soup',

      ingredients: ingredients,
      steps: steps,
      time: time,

      // Note: allows for the state to not be upated and for cancel to still work
      temp_ingredients: ingredients,
      temp_steps: steps,
      temp_time: time,
    }
  }

  toggleEdit () {
    this.setState(prevState => {
      return { editing: !prevState.editing }
    })
    console.log('toggleEdit to', this.state.editing)
  }

  handleChange (e) {
    this.setState({ ['temp_' + e.target.name]: e.target.value })
    console.log('handled change')
  }

  share () {
    console.log('share recipe')
  }

  saveData (e) {
    e.preventDefault()

    this.setState(
      {
        editing: false,
        steps: this.state.temp_steps,
        ingredients: this.state.temp_ingredients,
        time: this.state.temp_time,
      }
    )
    console.log('saved data')
  }

  render () {
    return (
      <div>

        <nav className="grid container">
          <h1 className="col-xs-2">
            <Link to="/" className="nav-title">Caena</Link>
          </h1>

          <div className="col-xs-10 nav-right">
            <Link to="/cart" className="nav-item">Cart</Link>
            <Link to="/login" className="nav-item">Add Recipe</Link>
          </div>
        </nav>

        <form onSubmit={ (e) => this.saveData(e) } className="grid container">
          <div className="col-xs-12 flex-space-between">
            <h2 className="col-xs-12 no-margin center">
              { this.state.name }
            </h2>

            <div>
              <input
                onClick={ () => this.share() }
                type='button'
                className='button is-small no-background'
                value='share'
                name='share'/>

              {
                !this.state.editing &&
                  <input
                    onClick={ () => this.toggleEdit() }
                    type='button'
                    className='button is-small no-background'
                    value='edit'
                    name='edit'/>
              }
              {

                this.state.editing &&
                  <input
                   type='submit'
                   className='button is-small no-background'
                   value='save'
                   name='save'/>
              }

              {
                this.state.editing &&
                  <input
                      onClick={ () => this.toggleEdit() }
                      type='button'
                      className='button is-small no-background'
                      value='cancel'
                      name='cancel'/>
              }

            </div>
          </div>

          <section className="col-sm-4 col-xs-12 box">
            <h3 className="section-title">Ingredients</h3>
            {
              !this.state.editing
              ? <div dangerouslySetInnerHTML={{ __html: md.render(this.state.ingredients) }}></div>
              : <Textarea
                  onChange={ (e) => this.handleChange(e) }
                  className="textarea"
                  placeholder="enter ingredients"
                  defaultValue={ this.state.ingredients }
                  name='ingredients'
                />
            }
          </section>

          <section className="col-sm-8 col-xs-12 box">
            <div className="flex-space-between">
              <div className="flex-baseline">
                <h3 className="section-title">Preperation</h3>
                {
                  this.state.time != null && !this.state.editing &&
                    <span className="prep-time">
                      Time: { this.state.time }
                    </span>
                }
                {
                  this.state.editing &&
                    <div className="prep-time-container">
                      <span className="prep-time">Time: </span>

                      <div className="input-text">
                        <input
                          onChange={ (e) => this.handleChange(e) }
                          className='input'
                          type='text'
                          name='time'
                          defaultValue={ this.state.time }/>
                      </div>
                    </div>
                }
              </div>
            </div>
            {
              !this.state.editing
              ? <div dangerouslySetInnerHTML={{ __html: md.render(this.state.steps) }}></div>
              : <Textarea
                  onChange={ (e) => this.handleChange(e) }
                  className="textarea"
                  placeholder="enter steps"
                  defaultValue={ this.state.steps }
                  name='steps'
                  />
            }
          </section>

        </form>

        <footer className="center">
          Caena ※ 2017
        </footer>

      </div>
    )
  }
}

export default Recipe
