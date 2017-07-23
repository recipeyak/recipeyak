import React from 'react'
import { MemoryRouter } from 'react-router'
import { Provider } from 'react-redux'
import { mount } from 'enzyme'

import { emptyStore as store } from './store.js'

import Recipe from './Recipe.jsx'

describe('<Recipe/>', () => {
  it('renders without failure', () => {
    mount(
      <Provider store={ store }>
        <MemoryRouter>
          <Recipe/>
        </MemoryRouter>
      </Provider>)
  })
})
