import * as React from 'react'
import { MemoryRouter } from 'react-router'
import { Provider } from 'react-redux'
import { mount, configure } from 'enzyme'
import Adapter from 'enzyme-adapter-react-16'

import { emptyStore as store } from '../store/store'

import Team from './Team'

configure({ adapter: new Adapter() })

describe('<Team/>', () => {
  it('renders without crashing', () => {
    mount(
      <Provider store={ store }>
        <MemoryRouter>
          <Team fetchData={_ => _} id={1} />
        </MemoryRouter>
      </Provider>
    )
  })
})
