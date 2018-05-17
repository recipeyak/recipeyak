import {
  daysUntilSaturday
} from './date'

describe('date', () => {
  it('provides number of days from saturday', () => {
    const date = new Date('2018-5-31')
    expect(
      daysUntilSaturday(date)
    ).toEqual(2)
  })
})
