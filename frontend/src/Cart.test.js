import React from 'react'
import { MemoryRouter } from 'react-router'
import { mount } from 'enzyme'

import Cart from './Cart.jsx'

describe('<Cart/>', () => {
  it("doesn't explode on creation", () => {
    const recipes = {
      123: {
        id: 123,
        title: 'Recipe title',
        tags: ['tagOne', 'tagTwo'],
        author: 'Recipe author',
        source: '',
        url: '',
        ingredients: ['ingredientOne', 'ingredientTwo'],
      },
    }
    const cart = {
      123: 1,
    }
    const element = mount(
      <MemoryRouter>
        <Cart cart={ cart } recipes={ recipes }/>
      </MemoryRouter>
    )
    expect(element.find('Cart').props().cart).toEqual(cart)
  })
})
