import React from 'react'
import { MemoryRouter } from 'react-router'
import { Provider } from 'react-redux'
import { mount, configure } from 'enzyme'
import Adapter from 'enzyme-adapter-react-16'

import { emptyStore as store } from '../store/store'

import TeamInvite from './TeamInvite'

configure({ adapter: new Adapter() })

describe('<TeamInvite/>', () => {
  it('renders without crashing', () => {
    mount(
      <Provider store={ store }>
        <MemoryRouter>
          <TeamInvite />
        </MemoryRouter>
      </Provider>
    )
  })
})
