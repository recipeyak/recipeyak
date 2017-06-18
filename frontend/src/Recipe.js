import React from 'react'
import { Link } from 'react-router-dom'

import Textarea from 'react-textarea-autosize'
import MarkdownIt from 'markdown-it'

import Navbar from './Nav.js'

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

  saveData () {
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
      <div className="container">

        <Navbar/>

        <nav className="nav">

          <div className="nav-left">
            <Link to="/recipe" className="title is-3 nav-item">
              { this.state.name }
            </Link>
          </div>

          <div className="nav-right">
            <div className="nav-item">
              <input
                onClick={ () => this.share() }
                className="button"
                type='button'
                value='share'
                name='share'/>
            </div>

            {
              !this.state.editing &&
              <div className="nav-item">
                <input
                  className="button"
                  onClick={ () => this.toggleEdit() }
                  type='button'
                  value='edit'
                  name='edit'/>
              </div>
            }
            {

              this.state.editing &&
              <div className="nav-item">
                <input
                  onClick={ () => this.saveData() }
                  className="button"
                  type='button'
                  value='save'
                  name='save'/>
              </div>
            }

            {
              this.state.editing &&
              <div className="nav-item">
                <input
                  className="button"
                  onClick={ () => this.toggleEdit() }
                  type='button'
                  value='cancel'
                  name='cancel'/>
              </div>
            }

          </div>
        </nav>

        <div className="container columns">
          <div className="column is-one-third">
            <section className="box">
              <h3 className="title is-3" >Ingredients</h3>
              {
                !this.state.editing
                ? <div className="content" dangerouslySetInnerHTML={{ __html: md.render(this.state.ingredients) }}></div>
                : <Textarea
                    className="textarea"
                    onChange={ (e) => this.handleChange(e) }
                    placeholder="enter ingredients"
                    defaultValue={ this.state.ingredients }
                    name='ingredients'
                  />
              }
            </section>
          </div>

          <div className="column">
            <section className="column box">
              <div>
                <div>
                  <h3 className="title is-3">Preperation</h3>
                  {
                    this.state.time != null && !this.state.editing &&
                      <span>
                        Time: { this.state.time }
                      </span>
                  }
                  {
                    this.state.editing &&
                      <div>
                        <span>Time: </span>

                        <div>
                          <input
                            className="input"
                            onChange={ (e) => this.handleChange(e) }
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
                ? <div className="content" dangerouslySetInnerHTML={{ __html: md.render(this.state.steps) }}></div>
                : <Textarea
                    className="textarea"
                    onChange={ (e) => this.handleChange(e) }
                    placeholder="enter steps"
                    defaultValue={ this.state.steps }
                    name='steps'
                    />
              }
            </section>
          </div>

        </div>

        <footer>
          Caena ※ 2017
        </footer>

      </div>
    )
  }
}

export default Recipe
