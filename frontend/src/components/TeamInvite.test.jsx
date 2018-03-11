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

    // fake react router props
    const match = {
      params: {
        id: 1
      }
    }
    mount(
      <Provider store={ store }>
        <MemoryRouter>
          <TeamInvite match={ match }/>
        </MemoryRouter>
      </Provider>
    )
  })
})
