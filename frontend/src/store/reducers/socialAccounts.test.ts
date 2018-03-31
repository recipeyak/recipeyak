import socialAccounts from './socialAccounts'

import {
  setSocialConnections
} from '../actions'

describe('SocialConnections', () => {
  it('it sets social connection', () => {
    const beforeState = {
    }

    const afterState = {
    }

    const data = [{ id: 1, provider: 'github' }]

    expect(
      socialAccounts(beforeState, setSocialConnections(data as any))
    ).toEqual(afterState)
  })
})
