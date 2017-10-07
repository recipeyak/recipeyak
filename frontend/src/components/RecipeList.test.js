import React from 'react'
import { mount } from 'enzyme'
import { Provider } from 'react-redux'
import { MemoryRouter } from 'react-router-dom'

import { emptyStore as store } from '../store/store.js'
import RecipeList from './RecipeList.jsx'
import { matchesQuery } from './RecipeList.jsx'

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
      title: 'Recipe title',
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
      title: 'Recipe title',
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

  it('ensure search works', () => {
    const recipe = {
      id: 12,
      name: 'West Canadian Creme Brulee',
      author: 'T. Philip',
      source: 'Unknown',
      time: '1 Hour',
      ingredients: [
        {
          id: 84,
          text: 'Half and Half'
        },
        {
          id: 85,
          text: 'Vanilla'
        }
      ],
      steps: [
        {
          id: 34,
          text: 'Mix everything together'
        }
      ],
      tags: []
    }

    const query = 'vanilla'

    const results = matchesQuery(recipe, query)

    expect(results).toEqual(true)
  })
})
