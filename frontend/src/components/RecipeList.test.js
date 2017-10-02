import React from 'react'
import { mount } from 'enzyme'
import { Provider } from 'react-redux'
import { MemoryRouter } from 'react-router-dom'

import { emptyStore as store } from '../store/store.js'
import RecipeList from './RecipeList.jsx'

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
      ingredients: ['ingredientOne', 'ingredientTwo'],
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
      ingredients: [''],
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
