import React from 'react'

import { mount, configure } from 'enzyme'
import Adapter from 'enzyme-adapter-react-16';
configure({ adapter: new Adapter() });

import { Provider } from 'react-redux'
import { MemoryRouter } from 'react-router'

import { emptyStore as store } from '../store/store.js'
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
