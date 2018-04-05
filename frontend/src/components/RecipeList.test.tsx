import * as React from 'react'
import { mount, configure } from 'enzyme'
import Adapter from 'enzyme-adapter-react-16'

import { Provider } from 'react-redux'
import { MemoryRouter } from 'react-router-dom'

import { emptyStore as store } from '../store/store'
import RecipeList, { matchesQuery } from './RecipeList'

configure({ adapter: new Adapter() })

describe('<RecipeList/>', () => {
  it('renders without crashing', () => {
    mount(
      <Provider store={ store }>
        <MemoryRouter>
          <RecipeList
            fetchData={() => true }
          />
        </MemoryRouter>
      </Provider>)
  })

  it('accepts props', () => {
    const recipes = [{
      id: 123,
      name: 'Recipe Name',
      tags: ['tagOne', 'tagTwo'],
      author: 'Recipe author',
      source: '',
      url: '',
      ingredients: ['ingredientOne', 'ingredientTwo']
    }]
    const element = mount(
      <Provider store={ store }>
        <MemoryRouter>
          <RecipeList
            recipes={recipes}
            fetchData={() => true }
          />
        </MemoryRouter>
      </Provider>)
    expect(element.find('RecipeList').props().recipes).toEqual(recipes)
  })

  it('handles recipes object without tags', () => {
    const recipes = [{
      id: 123,
      name: 'Recipe Name',
      author: 'Recipe author',
      source: '',
      url: '',
      ingredients: ['']
    }]
    mount(
      <Provider store={ store }>
        <MemoryRouter>
          <RecipeList
            recipes={recipes}
            fetchData={() => true }
          />
        </MemoryRouter>
      </Provider>)
  })
})

describe('searching', () => {
  it('works with basic matching', () => {
    const recipe = {
      name: 'West Canadian Creme Brulee',
      author: 'T. Philip',
    }

    const query = 'creme'

    const results = matchesQuery(recipe, query)

    expect(results).toEqual(true)
  })

  it('works with spaces matching', () => {
    const recipe = {
      name: 'West Canadian Creme Brulee',
      author: 'T. Philip',
    }

    const query = 'westcanad'

    const results = matchesQuery(recipe, query)

    expect(results).toEqual(true)
  })

  it('ignores accents', () => {
    const recipe = {
      name: 'Crème Brulée'
    }

    const query = 'crem'

    const results = matchesQuery(recipe, query)

    expect(results).toEqual(true)
  })

  it('respects tag name', () => {
    const recipe = {
      name: 'Beef Bourguignon'
    }

    const query = 'name:beef'

    const results = matchesQuery(recipe, query)

    expect(results).toEqual(true)
  })

  it('respects tag ingredient', () => {
    const recipe = {
      name: 'Beef Bourguignon',
      author: 'J. Doe',
      ingredients: [
        {
          name: 'salt'
        }
      ]
    }

    const query = 'ingredient:salt'

    const results = matchesQuery(recipe, query)

    expect(results).toEqual(true)
  })

  it('respects tag author', () => {
    const recipe = {
      name: 'Beef Bourguignon',
      author: 'J. Doe'
    }

    const query = 'author:doe'

    const results = matchesQuery(recipe, query)

    expect(results).toEqual(true)
  })
})
