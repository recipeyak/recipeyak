import React from 'react'

import { mount, configure } from 'enzyme'
import Adapter from 'enzyme-adapter-react-16'

import { MemoryRouter } from 'react-router'
import RecipeItem from './RecipeItem'

configure({ adapter: new Adapter() })

describe('RecipeItem', () => {
  it('renders without crashing', () => {
    const recipe = {
      id: 123,
      title: 'Some recipe title',
      author: 'Recipe author',
      url: '/someurl',
      source: 'http://example.com/recipeTitle',
      tags: ['OneTag', 'TwoTag'],
      removeFromCart: () => console.log('Remove from cart'),
      addToCart: () => console.log('Add to cart')
    }
    mount(<MemoryRouter><RecipeItem {...recipe} /></MemoryRouter>)
  })
  it('renders without tags', () => {
    const recipe = {
      id: 123,
      title: 'Some recipe title',
      author: 'Recipe author',
      url: '/someurl',
      source: 'http://example.com/recipeTitle',
      removeFromCart: () => console.log('Remove from cart'),
      addToCart: () => console.log('Add to cart')
    }
    mount(<MemoryRouter><RecipeItem {...recipe} /></MemoryRouter>)
  })
})
