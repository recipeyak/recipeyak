import React from 'react'

import { connect } from 'react-redux'

import {
  ButtonPlain,
  ButtonPrimary,
  ButtonDanger
} from './Buttons'

import {
  settingUserTeamLevel,
  deletingMembership,
} from '../store/actions'


const mapStateToProps = (state, props) => ({
  isUser: state.user.id === props.userID
})


const mapDispatchToProps = dispatch => ({
  handleUserLevelChange: (teamID, membershipID, level) =>
    dispatch(settingUserTeamLevel(teamID, membershipID, level)),
  deleteMembership: (teamID, membershipID) => dispatch(deletingMembership(teamID, membershipID)),

})

const MemberRow = ({
  teamID,
  membershipID,
  userID,
  avatarURL,
  name = '',
  email,
  level,
  handleUserLevelChange,
  deleteMembership,
  isUser,
}) =>
  <tr key={ membershipID }>
    <td className="d-flex align-items-center pr-4">
      <div className="w-50px mr-2 d-flex align-items-center">
        <img src={ avatarURL } className="br-10-percent" alt='avatar'/>
      </div>
      <div className="d-flex direction-column">
        <span className="bold">
          { name !== ''
              ? name
              : email
          }
        </span>
        <span>{ email }</span>
      </div>
    </td>
    <td className="vertical-align-middle pr-4">
      <section className="bold d-flex align-items-start direction-column">
        <span>{ level }</span>
        { level === 'INVITED'
            ? <ButtonPlain className="is-small">
              Resend Invite
            </ButtonPlain>
            : null
        }
      </section>
    </td>
    <td className="vertical-align-middle pr-4">
      <div className="select is-small">
        <select value={ level } onChange={ e => handleUserLevelChange(teamID, membershipID, e.target.value) }>
          <option value="admin">Admin</option>
          <option value="contributor">Contributor</option>
          <option value="read">Read</option>
        </select>
      </div>
    </td>
    <td className="vertical-align-middle text-right">
      <ButtonDanger onClick={ () => deleteMembership(teamID, membershipID) } className="is-small">
        { isUser
          ? 'leave'
          : 'remove'
        }
      </ButtonDanger>
    </td>
  </tr>


const ConnectedMemberRow = connect(
  mapStateToProps,
  mapDispatchToProps
)(MemberRow)

export default ConnectedMemberRow
