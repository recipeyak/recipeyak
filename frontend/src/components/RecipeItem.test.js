import React from 'react'
import { mount } from 'enzyme'
import { MemoryRouter } from 'react-router'
import RecipeItem from './RecipeItem.jsx'

describe('RecipeItem', () => {
  it('renders without crashing', () => {
    const recipe = {
      id: 123,
      title: 'Some recipe title',
      author: 'Recipe author',
      url: '/someurl',
      source: 'http://example.com/recipeTitle',
      tags: ['OneTag', 'TwoTag'],
      inCart: false,
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
      inCart: false,
      removeFromCart: () => console.log('Remove from cart'),
      addToCart: () => console.log('Add to cart')
    }
    mount(<MemoryRouter><RecipeItem {...recipe} /></MemoryRouter>)
  })
})
