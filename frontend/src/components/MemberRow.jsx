import React from "react";

import { connect } from "react-redux";

import { ButtonPlain, ButtonDanger } from "./Buttons";

import { settingUserTeamLevel, deletingMembership } from "../store/actions";

const mapStateToProps = (state, { userID, teamID, membershipID }) => ({
  isUser: state.user.id === userID,
  deleting: state.teams[teamID].members[membershipID].deleting,
  userIsTeamAdmin: Object.values(state.teams[teamID].members)
    .filter(x => x.level === "admin")
    .some(({ user }) => user.id === state.user.id)
});

const mapDispatchToProps = dispatch => ({
  handleUserLevelChange: (teamID, membershipID, level) =>
    dispatch(settingUserTeamLevel(teamID, membershipID, level)),
  deleteMembership: (teamID, membershipID, leaving) =>
    dispatch(deletingMembership(teamID, membershipID, leaving))
});

const MemberRow = ({
  teamID,
  userIsTeamAdmin,
  membershipID,
  avatarURL,
  email,
  level,
  handleUserLevelChange,
  deleteMembership,
  isUser,
  isActive,
  deleting
}) => (
  <tr key={membershipID}>
    <td className="d-flex align-items-center pr-4">
      <div className="w-50px mr-2 d-flex align-items-center">
        <img src={avatarURL} className="br-10-percent" alt="avatar" />
      </div>
      <div className="d-flex direction-column">
        <b>{email}</b>
      </div>
    </td>
    <td className="vertical-align-middle pr-4">
      {!isActive ? (
        <section className="d-flex align-items-start direction-column">
          <p className="bold">invite sent</p>
          <ButtonPlain className="is-small">Resend Invite</ButtonPlain>
        </section>
      ) : null}
    </td>
    <td className="vertical-align-middle pr-4">
      {userIsTeamAdmin ? (
        <div className="select is-small">
          <select
            value={level}
            onChange={e =>
              handleUserLevelChange(teamID, membershipID, e.target.value)
            }
          >
            <option value="admin">Admin</option>
            <option value="contributor">Contributor</option>
            <option value="read">Read</option>
          </select>
        </div>
      ) : (
        <p>
          <b>{level}</b>
        </p>
      )}
    </td>
    <td className="vertical-align-middle text-right">
      {isUser || userIsTeamAdmin ? (
        <ButtonDanger
          onClick={() => deleteMembership(teamID, membershipID, isUser)}
          loading={deleting}
          className="is-small"
        >
          {isUser ? "leave" : "remove"}
        </ButtonDanger>
      ) : null}
    </td>
  </tr>
);

const ConnectedMemberRow = connect(
  mapStateToProps,
  mapDispatchToProps
)(MemberRow);

export default ConnectedMemberRow;
