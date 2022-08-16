import { connect } from "react-redux"

import { Avatar } from "@/components/Avatar"
import { ButtonDanger, ButtonPlain } from "@/components/Buttons"
import { Select } from "@/components/Forms"
import { IMember, ITeam } from "@/store/reducers/teams"
import { IUser } from "@/store/reducers/user"
import { IState } from "@/store/store"
import {
  deletingMembershipAsync,
  Dispatch,
  settingUserTeamLevelAsync,
} from "@/store/thunks"
import { notUndefined } from "@/utils/general"

interface IMemberRowProps {
  readonly userID: IUser["id"]
  readonly teamID: ITeam["id"]
  readonly userIsTeamAdmin?: boolean
  readonly membershipID: IMember["id"]
  readonly avatarURL: string
  readonly email: string
  readonly level: IMember["level"]
  readonly handleUserLevelChange: (
    teamID: ITeam["id"],
    membershipID: IMember["id"],
    level: IMember["level"],
  ) => void
  readonly deleteMembership: (
    teamID: ITeam["id"],
    membershipID: IMember["id"],
    leaving?: boolean,
  ) => void
  readonly isUser?: boolean
  readonly isActive?: IMember["is_active"]
  readonly deleting?: IMember["deleting"]
}

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
  deleting,
}: IMemberRowProps) => (
  <tr key={membershipID}>
    <td className="d-flex align-items-center pr-4">
      <Avatar avatarURL={avatarURL} className="mr-2" />
      <div className="d-flex direction-column">
        <b>{email}</b>
      </div>
    </td>
    <td className="vertical-align-middle pr-4">
      {!isActive ? (
        <section className="d-flex align-items-start direction-column">
          <p className="bold">invite sent</p>
          <ButtonPlain size="small">Resend Invite</ButtonPlain>
        </section>
      ) : null}
    </td>
    <td className="vertical-align-middle pr-4">
      {userIsTeamAdmin ? (
        <Select
          size="small"
          value={level}
          onChange={(e) => {
            handleUserLevelChange(
              teamID,
              membershipID,
              /* eslint-disable-next-line @typescript-eslint/consistent-type-assertions */
              e.target.value as "admin" | "contributor" | "read",
            )
          }}
        >
          <option value="admin">Admin</option>
          <option value="contributor">Contributor</option>
          <option value="read">Read</option>
        </Select>
      ) : (
        <p>
          <b>{level}</b>
        </p>
      )}
    </td>
    <td className="vertical-align-middle text-right">
      {isUser || userIsTeamAdmin ? (
        <ButtonDanger
          size="small"
          onClick={() => {
            deleteMembership(teamID, membershipID, isUser)
          }}
          loading={deleting}
        >
          {isUser ? "leave" : "remove"}
        </ButtonDanger>
      ) : null}
    </td>
  </tr>
)

const mapStateToProps = (
  state: IState,
  {
    userID,
    teamID,
    membershipID,
  }: Pick<IMemberRowProps, "userID" | "teamID" | "membershipID">,
) => {
  const team = state.teams.byId[teamID]
  const members = team?.members ?? {}
  const member = members[membershipID]
  const deleting = member?.deleting ?? false
  return {
    isUser: state.user.id === userID,
    deleting,
    userIsTeamAdmin: Object.values(members)
      .filter(notUndefined)
      .filter((x) => x.level === "admin")
      .some(({ user }) => user.id === state.user.id),
  }
}

const mapDispatchToProps = (dispatch: Dispatch) => ({
  handleUserLevelChange: settingUserTeamLevelAsync(dispatch),
  deleteMembership: deletingMembershipAsync(dispatch),
})

export default connect(mapStateToProps, mapDispatchToProps)(MemberRow)
