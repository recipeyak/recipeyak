import React from 'react'
import { MemoryRouter } from 'react-router'
import { mount } from 'enzyme'

import SearchResult from './SearchResult.jsx'

describe('<SearchResult/>', () => {
  it('renders without crashing', () => {
    const recipe = {
      url: '/recipes/1/',
    }

    const cart = {}

    mount(
      <MemoryRouter>
        <SearchResult
          { ...recipe }
          cart={ cart }
        />
      </MemoryRouter>)
  })
})
