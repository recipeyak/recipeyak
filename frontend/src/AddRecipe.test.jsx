import React from 'react'
import { mount } from 'enzyme'
import { Provider } from 'react-redux'
import { MemoryRouter } from 'react-router'

import { emptyStore as store } from './store.js'
import AddRecipe from './AddRecipe.jsx'

describe('<AddRecipe/>', () => {
  it('renders without crashing', () => {
    mount(
      <Provider store={ store }>
        <MemoryRouter>
          <AddRecipe/>
        </MemoryRouter>
      </Provider>)
  })
})
