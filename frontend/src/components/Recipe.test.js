import React from 'react'
import { MemoryRouter } from 'react-router'
import { Provider } from 'react-redux'

import { mount, configure } from 'enzyme'
import Adapter from 'enzyme-adapter-react-16';
configure({ adapter: new Adapter() });

import { emptyStore as store } from '../store/store.js'

import Recipe from './Recipe.jsx'

describe('<Recipe/>', () => {
  it('renders without failure', () => {
    const props = {
      ingredients: [],
      steps: [],
      name: '',
      author: '',
      source: '',
      time: '',
      // a bodge to mock out `this.props.match.params.id`
      match: {
        params: {
          id: 1
        }
      },
      fetchRecipe: () => true
    }
    mount(
      <Provider store={ store }>
        <MemoryRouter>
          <Recipe {...props}/>
        </MemoryRouter>
      </Provider>)
  })
})
