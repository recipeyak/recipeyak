import React from 'react'
import { MemoryRouter } from 'react-router'
import { Provider } from 'react-redux'
import { mount } from 'enzyme'

import { emptyStore as store } from '../store/store.js'
import Nav from './Nav.jsx'

describe('<Nav/>', () => {
  it('renders without failure', () => {
    mount(
      <Provider store={ store }>
        <MemoryRouter>
          <Nav fetchData={ () => true } />
        </MemoryRouter>
      </Provider>)
  })
})
