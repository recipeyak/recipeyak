import React from 'react'
import { MemoryRouter } from 'react-router'
import { Provider } from 'react-redux'

import { mount, configure } from 'enzyme'
import Adapter from 'enzyme-adapter-react-16'

import { emptyStore as store } from '../store/store'
import Cart from './Cart.tsx'

configure({ adapter: new Adapter() })

describe('<Cart/>', () => {
  it("doesn't explode on creation", () => {
    const recipes = [
      123: {
        id: 123,
        title: 'Recipe title',
        tags: ['tagOne', 'tagTwo'],
        author: 'Recipe author',
        source: '',
        url: '',
        ingredients: ['ingredientOne', 'ingredientTwo']
      }
    ]

    const cart = {
      123: 1
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
})
