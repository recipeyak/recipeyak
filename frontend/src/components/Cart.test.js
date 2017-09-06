import React from 'react'
import { MemoryRouter } from 'react-router'
import { Provider } from 'react-redux'
import { mount } from 'enzyme'

import { emptyStore as store } from '../store/store.js'
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
      <Provider store={ store }>
        <MemoryRouter>
          <Cart cart={ cart } recipes={ recipes }/>
        </MemoryRouter>
      </Provider>
    )
    expect(element.find('Cart').props().cart).toEqual(cart)
  })
  it('handles having no data', () => {
    mount(
      <Provider store={ store }>
        <MemoryRouter>
          <Cart/>
        </MemoryRouter>
      </Provider>)
  })
})
