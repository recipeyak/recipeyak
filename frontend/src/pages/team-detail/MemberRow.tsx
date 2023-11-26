import { Avatar } from "@/components/Avatar"
import { Button } from "@/components/Buttons"
import { Select } from "@/components/Forms"
import { useUser } from "@/hooks"
import { IMember, ITeam } from "@/queries/teamFetch"
import { useTeamMemberDelete } from "@/queries/teamMemberDelete"
import { useTeamMemberUpdate } from "@/queries/teamMemberUpdate"
import { IUser } from "@/queries/userFetch"

const MemberRow = ({
  userID,
  teamID,
  isTeamAdmin,
  membershipID,
  avatarURL,
  email,
  level,
  isActive,
}: {
  readonly userID: IUser["id"]
  readonly teamID: ITeam["id"]
  readonly isTeamAdmin: boolean
  readonly membershipID: IMember["id"]
  readonly avatarURL: string
  readonly email: string
  readonly level: IMember["level"]
  readonly isActive?: IMember["is_active"]
}) => {
  const deleteTeamMember = useTeamMemberDelete()
  const updateTeamMember = useTeamMemberUpdate()
  const user = useUser()
  const isUser = user.id === userID
  return (
    <tr key={membershipID}>
      <td className="flex items-center pr-4">
        <Avatar avatarURL={avatarURL} className="mr-2" />
        <div className="flex flex-col">
          <b>{email}</b>
        </div>
      </td>
      <td className="align-middle pr-4">
        {!isActive ? (
          <section className="flex items-start flex-col">
            <p className="font-bold">invite sent</p>
            <Button size="small">Resend Invite</Button>
          </section>
        ) : null}
      </td>
      <td className="align-middle pr-4">
        {isTeamAdmin ? (
          <Select
            value={level}
            onChange={(e) => {
              updateTeamMember.mutate({
                teamId: teamID,
                memberId: membershipID,
                // eslint-disable-next-line @typescript-eslint/consistent-type-assertions
                level: e.target.value as "admin" | "contributor" | "read",
              })
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
      <td className="align-middle text-right">
        {isUser || isTeamAdmin ? (
          <Button
            variant="danger"
            size="small"
            onClick={() => {
              deleteTeamMember.mutate({
                teamId: teamID,
                memberId: membershipID,
              })
            }}
            loading={deleteTeamMember.isPending}
          >
            {isUser ? "leave" : "remove"}
          </Button>
        ) : null}
      </td>
    </tr>
  )
}

export default MemberRow
