import React from 'react'
import {MemoryRouter} from 'react-router'
import {mount} from 'enzyme'

import Cart from './Cart.jsx'

describe('<Cart/>', () => {
  it('renders without crashing', () => {
    mount(<MemoryRouter><Cart/></MemoryRouter>)
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
    const element = mount(<MemoryRouter><Cart cart={recipes}/></MemoryRouter>)
    expect(element.find('Cart').props().cart).toEqual(recipes)
  })
})
