import * as React from 'react'
import { FormEvent, ChangeEvent } from 'react'
import { Helmet } from 'react-helmet'
import {
  Link
} from 'react-router-dom'

import Recipe from '../containers/RecipeItem'
import MemberRow from './MemberRow'

import NoMatch from './NoMatch'

import Loader from './Loader'

import {
  Recipe as IRecipe,
} from '../store/reducers/recipes'


import {
  Member,
  TeamOptional,
} from '../store/reducers/teams'


import {
  ButtonPrimary,
  ButtonLink,
} from './Buttons'

import {
  inviteURL,
  teamURL,
  teamSettingsURL,
} from '../urls'

const CenteredLoader = () =>
  <div className="d-flex justify-content-center">
    <Loader/>
  </div>

interface ITeamMembers {
  id: number
  members: {
    [key:number]: Member
  }
  loading: boolean
}

const TeamMembers = ({ id, members, loading }: ITeamMembers) =>
  <div>
    <section className="d-flex justify-space-between align-items-center">
      <h2 className="fs-6">Members</h2>
      <Link className="button is-primary" to={ inviteURL(id) }>
        Invite
      </Link>
    </section>
    { loading
        ? <CenteredLoader/>
        : Object.values(members).length > 0
            ? <div className="table-responsive">
                <table className="table-spacing">
                  <tbody>
                  {
                    Object.values(members).map(x =>
                      <MemberRow
                        key={x.id}
                        teamID={id}
                        userID={x.user.id}
                        membershipID={x.id}
                        level={x.level}
                        avatarURL={x.user.avatar_url}
                        email={x.user.email}
                        isActive={x.is_active}
                        />)
                  }
                  </tbody>
                </table>
              </div>
            : <section>
                <h1 className="text-center fs-6 bold text-muted">No Team Members</h1>
                <p className="text-center">Add one via the Invite button</p>
              </section>
    }
  </div>

interface ITeamRecipes {
  loading: boolean
  recipes: IRecipe[]
}

const TeamRecipes = ({ loading, recipes }: ITeamRecipes) =>
  <div>
    <section className="d-flex justify-space-between align-items-center">
      <h2 className="fs-6 mb-2">Recipes</h2>
      <Link to="/recipes/add" className="button is-primary">
        Create Recipe
      </Link>
    </section>
    { loading
      ? <CenteredLoader/>
      : recipes.length === 0
          ? <section>
              <h1 className="text-center fs-6 bold text-muted">No Team Recipes</h1>
              <p className="text-center">Use the Create Recipe button to add one.</p>
            </section>
          : <section className="recipe-grid">
            { recipes.map(recipe =>
                <Recipe
                  {...recipe}
                  key={ recipe.id }
                />
              )
            }
          </section>
    }
  </div>

interface TeamSettingsState {
  name: string
  loadingDeleteTeam: boolean
  loadingSaveChanges: boolean
}

interface TeamSettingsProps {
  id: number
  name: string
  updatingTeam(id: number, team: TeamOptional): void
  deleteTeam(id: number): void
  loading: boolean
}

class TeamSettings extends React.Component<TeamSettingsProps, TeamSettingsState> {
  state = {
    name: 'loading...',
    loadingDeleteTeam: false,
    loadingSaveChanges: false,
  }

  static defaultProps = {
    name: 'loading',
    id: 0,
  }

  componentWillMount () {
    this.setState({ name: this.props.name })
  }

  componentWillReceiveProps (nextProps: TeamSettingsProps) {
    this.setState({ name: nextProps.name })
  }

  handleInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    this.setState({ name: e.target.value })
  }

  handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    this.setState({ loadingSaveChanges: true })
    this.props.updatingTeam(this.props.id, { name: this.state.name })
    .finally(() => this.setState({ loadingSaveChanges: false }))
  }

  deleteTeam = () => {
    if (confirm(`Are you sure you want to delete this team "${this.props.name}"?`)) {
      this.setState({ loadingDeleteTeam: true })
      this.props.deleteTeam(this.props.id)
      .finally(() => this.setState({ loadingDeleteTeam: false }))
    }
  }

  render () {
    return (
      <form onSubmit={this.handleSubmit}>
        <div className="field">
          <label className="label">Team Name</label>
            <input
              disabled={this.props.loading}
              onChange={this.handleInputChange}
              className="my-input"
              type="text"
              placeholder="The Grand Budapest Staff"
              value={this.state.name}
              name="name"/>
        </div>
        <div className="d-flex justify-space-between align-items-center">
          <ButtonPrimary type="submit" loading={this.state.loadingSaveChanges}>
            Save Changes
          </ButtonPrimary>
          <ButtonLink onClick={() => this.deleteTeam()} loading={this.state.loadingDeleteTeam}>
            Delete Team
          </ButtonLink>
        </div>
      </form>
    )
  }
}

interface ITeamName {
  loading: boolean
  name: string
}

const TeamName = ({ loading, name }: ITeamName) => {
  if (loading) {
    return <CenteredLoader/>
  }
  return (
    <div>
      <h1 className="fs-9 text-center fw-500 p-3">{ name }</h1>
    </div>
  )
}

interface TeamNameProps {
  id: number
  name: string
  fetchData(id: number): void
  loadingRecipes: boolean
  recipes: IRecipe[]
  updatingTeam: boolean
  isSettings: boolean
  loadingMembers: boolean
  loadingTeam: boolean
  members: {
    [key:number]: Member
  }
  deleteTeam(): void
  error404: boolean
}

class Team extends React.Component<TeamNameProps, {}> {
  componentWillMount () {
    this.props.fetchData(this.props.id)
  }

  componentWillReceiveProps (nextProps: TeamNameProps) {
    const newID = nextProps.id !== this.props.id
    if (newID) {
      this.props.fetchData(nextProps.id)
    }
  }

  static defaultProps = {
    members: {},
    invites: {},
    recipes: [] as IRecipe[],
    loadingTeam: true,
    loadingMembers: true,
    loadingRecipes: true,
    isSettings: false,
  }

  render () {
    if (this.props.error404) {
      return <NoMatch/>
    }

    return (
      <div>
        <Helmet title="Team"/>
        <TeamName
          loading={this.props.loadingTeam}
          name={this.props.name}/>
        <div className="tabs is-boxed">
          <ul>
            <li className={ !this.props.isSettings ? 'is-active' : ''}>
              <Link to={teamURL(this.props.id)}>
                <span>Team</span>
              </Link>
            </li>
            <li className={ this.props.isSettings ? 'is-active' : '' }>
              <Link to={teamSettingsURL(this.props.id)}>
                <span>Settings</span>
              </Link>
            </li>
          </ul>
        </div>
        { this.props.isSettings
            ? <TeamSettings
                id={ this.props.id }
                name={ this.props.name }
                updatingTeam={ this.props.updatingTeam }
                deleteTeam={ this.props.deleteTeam }
                loading={ this.props.loadingTeam }/>
            : (
              <div>
                <TeamMembers
                  id={ this.props.id }
                  loading={ this.props.loadingMembers }
                  members={ this.props.members }
                />

                <TeamRecipes
                  loading={ this.props.loadingRecipes }
                  recipes={ this.props.recipes } />
              </div>
            )
        }

      </div>
    )
  }
}

export default Team
