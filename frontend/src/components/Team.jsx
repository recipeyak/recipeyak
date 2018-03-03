import React from 'react'
import { Helmet } from 'react-helmet'

import Recipe from '../containers/RecipeItem'

import {
  ButtonPlain,
  ButtonPrimary,
  ButtonDanger
} from './Buttons'

class Team extends React.Component {
  render () {
    const name = 'Recipe Yak Team'
    const members = [
      {
        id: 1,
        name: 'Joe Shmoe',
        email: 'j.shm123@example.com',
        avatarURL: '//www.gravatar.com/avatar/860841962137d13d97b2c544138d4274?d=identicon&r=g',
        status: 'INVITED',
        role: 'ADMIN'
      },
      {
        id: 2,
        name: '',
        email: 'd.jones@example.com',
        avatarURL: '//www.gravatar.com/avatar/860841962137d13d97b2c544138d4274?d=identicon&r=g',
        status: 'INVITED',
        role: 'MEMBER'
      },
      {
        id: 3,
        name: 'Jane Doe',
        email: 'doe2@example.com',
        avatarURL: '//www.gravatar.com/avatar/860841962137d13d97b2c544138d4274?d=identicon&r=g',
        status: 'ACTIVE',
        role: 'VIEWER'
      },
    ]

    const recipes = [
      {
        id: 1,
        name: 'asdfasdfjasldf',
        author: '',
        source: '',
        time: '',
        ingredients: [{
          id: 1,
          quantity: '3lbs',
          name: 'tomato',
          description: ''
        }],
        steps: [{
          id: 1,
          text: 'lskdfsdjfklsdfa;sjdf;kasljdf'
        }],
        tags: [],
        servings: '',
        edits: 0,
        modified: '2018-03-03T02:17:57.079392Z',
        cart_count: 0,
        team: null
      }
    ]

    return (
      <div>
        <Helmet title="Team"/>
        <h1 className="fs-9 text-center fw-500 p-4">{ name }</h1>
        <section className="d-flex justify-space-between align-items-center">
          <h2 className="fs-6">Members</h2>
          <ButtonPrimary>
            Invite
          </ButtonPrimary>
        </section>
        <div className="table-responsive">
        <table className="table-spacing">
          <tbody>
          {
            members.map(x => <tr>
              <td key={x.id} className="d-flex align-items-center pr-4">
                <div className="w-50px mr-2">
                  <img src={ x.avatarURL } className="br-10-percent" alt='avatar'/>
                </div>
                <div className="d-flex direction-column">
                  <span className="bold">
                  { x.name !== ''
                      ? x.name
                      : x.email
                  }
                  </span>
                  <span>{ x.email }</span>
                </div>
              </td>
              <td className="vertical-align-middle pr-4">
                <section className="bold d-flex align-items-start direction-column">
                <span>{ x.status.toLowerCase() }</span>
                { x.status === 'INVITED'
                    ? <ButtonPlain className="is-small">
                        Resend Invite
                      </ButtonPlain>
                    : null
                }
                </section>
              </td>
              <td className="vertical-align-middle pr-4">
              <div class="select is-small">
                <select value={ x.role }>
                  <option value="ADMIN">Admin</option>
                  <option value="MEMBER">Member</option>
                  <option value="VIEWER">Viewer</option>
                </select>
              </div>
              </td>
              <td className="vertical-align-middle text-right">
                <ButtonDanger className="is-small">
                  remove
                </ButtonDanger>
              </td>
            </tr>
            )
          }
          </tbody>
        </table>
        </div>
        <section className="d-flex justify-space-between align-items-center">
          <h2 className="fs-6 mb-2">Recipes</h2>
          <ButtonPrimary>
            Create Recipe
          </ButtonPrimary>
        </section>
        <section className="recipe-grid">
          { recipes.length === 0
              ? <p>No recipes yet</p>
              : recipes.map(recipe =>
                  <Recipe
                    {...recipe}
                    className='mb-0'
                    key={ recipe.id }
                  />
                )
          }
        </section>
      </div>
    )
  }
}

export default Team
