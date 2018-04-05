import * as React from 'react'
import { MemoryRouter } from 'react-router'
import { Provider } from 'react-redux'
import { mount, configure } from 'enzyme'
import Adapter from 'enzyme-adapter-react-16'

import { emptyStore as store } from '../store/store'

import TeamInvite from './TeamInvite'

import { TeamInviteLevels } from '../store/actions'

configure({ adapter: new Adapter() })

describe('<TeamInvite/>', () => {
  it('renders without crashing', () => {
    // fake react router props
    const match = {
      params: {
        id: 1
      }
    }

    const props = {
      name: '',
      id: 0,
      loadingTeam: false,
      error404: false,
      sendingTeamInvites: false,
      sendInvites: (id: number, emails: string[], level: TeamInviteLevels) => {
        console.log(id, emails, level)
      },
      fetchData: (id: number) => {
        console.log(id)
      }
    }
    mount(
      <Provider store={ store }>
        <MemoryRouter>
          <TeamInvite match={ match } {...props}/>
        </MemoryRouter>
      </Provider>
    )
  })
})
