import React from 'react'
import { Helmet } from 'react-helmet'

import Recipe from '../containers/RecipeItem'

import {
  ButtonPlain,
  ButtonPrimary,
  ButtonDanger
} from './Buttons'

class TeamInvite extends React.Component {
  render () {
    const name = 'Recipe Yak Team'

    const roles = [
      {
        id: 1,
        name: 'Admin',
        value: 'ADMIN',
        description: 'Add and remove recipes, members.'
      },
      {
        id: 2,
        name: 'Member',
        value: 'MEMBER',
        description: 'Add and remove recipes and view all members.'
      },
      {
        id: 3,
        name: 'Viewer',
        value: 'VIEWER',
        description: 'View all team recipes and members.'
      },
    ]


    return (
      <div>
        <Helmet title="Team Invite"/>
        <h1 className="fs-9 text-center fw-500 p-4">{ name }</h1>
        <section className="d-flex justify-space-between align-items-center mb-2">
          <h2 className="fs-6">Invite Team Members</h2>
        </section>

        <form action="" className="">
          <input
            type="text"
            className="input mb-4"
            placeholder="emails seperated by commas • j@example.com,hey@example.com"/>
          {
            roles.map(({ id, name, value, description }) =>
              <label key={ id } className="d-flex align-items-center pb-4">
                <input type="radio" className="mr-2" name="role" value={ value }/>
                <div>
                  <h4 className="fs-4 fw-500">{ name }</h4>
                  <p className="text-muted">{ description }</p>
                </div>
              </label>
            )
          }
          <p className="mb-2">
            <b>Note:</b> Users without an account will be sent an email asking to create one.
          </p>
          <ButtonPrimary type="submit" className="justify-self-left">
            Invite
          </ButtonPrimary>
        </form>


      </div>
    )
  }
}

export default TeamInvite
