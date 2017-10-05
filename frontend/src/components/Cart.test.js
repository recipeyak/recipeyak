import React from 'react'
import { MemoryRouter } from 'react-router'
import { Provider } from 'react-redux'
import { mount } from 'enzyme'

import { emptyStore as store } from '../store/store.js'
import Cart from './Cart.jsx'

import { cartOccurances } from '../containers/Cart.jsx'

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

    const fetchData = () => true

    const element = mount(
      <Provider store={ store }>
        <MemoryRouter>
          <Cart fetchData={ fetchData } cart={ cart } recipes={ recipes }/>
        </MemoryRouter>
      </Provider>
    )

    expect(element.find('Cart').props().cart).toEqual(cart)
  })

  it('handles having no data', () => {
    const fetchData = () => true

    mount(
      <Provider store={ store }>
        <MemoryRouter>
          <Cart fetchData={ fetchData }/>
        </MemoryRouter>
      </Provider>)
  })

  it('maps recipes to ingredient objects', () => {
    const recipes = {
      1: {
        id: 1,
        name: 'test',
        ingredients: [
          {
            id: 1,
            text: 'testing',
          },
          {
            id: 1,
            text: 'testing',
          },
          {
            id: 2,
            text: 'asdf',
          },
        ],
      },
    }

    const cart = {
      1: 2,
    }

    const expected = [
      {
        count: 4,
        text: 'testing',
      },
      {
        count: 2,
        text: 'asdf',
      },
    ]

    expect(cartOccurances(recipes, cart)).toEqual(expected)
  })
})
