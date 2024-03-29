import { useState } from "react"
import { Link, RouteComponentProps } from "react-router-dom"

import { Button } from "@/components/Buttons"
import { NavPage } from "@/components/Page"
import { RadioButton } from "@/components/RadioButton"
import { TextInput } from "@/components/TextInput"
import { ROLES } from "@/pages/team-invite/teamConstants"
import { useTeam } from "@/queries/useTeamFetch"
import { useTeamInviteCreate } from "@/queries/useTeamInviteCreate"
import { teamURL } from "@/urls"

interface ITeamInviteProps extends RouteComponentProps<{ teamId: string }> {}

export function TeamInvitePage(props: ITeamInviteProps) {
  const id = parseInt(props.match.params.teamId, 10)
  const teamInfo = useTeam({ teamId: id })
  const sendInvites = useTeamInviteCreate()
  const [level, setLevel] = useState<"admin" | "contributor" | "read">(
    "contributor",
  )
  const [emails, setEmails] = useState("")

  if (teamInfo.isError) {
    return <div>error loading team</div>
  }
  if (teamInfo.isPending) {
    return <div>loading team...</div>
  }

  return (
    <NavPage title="Team Invite">
      <div className="mx-auto max-w-[800px]">
        <Link to={teamURL(id, teamInfo.data.name)}>
          <h1 className="p-4 text-center text-4xl font-medium">
            {teamInfo.data.name}
          </h1>
        </Link>

        {/* eslint-disable-next-line react/forbid-elements */}
        <section className="mb-2 flex items-center justify-between">
          <h2 className="text-2xl">Invite Team Members</h2>
        </section>
        <form
          action=""
          onSubmit={(e) => {
            e.preventDefault()
            sendInvites.mutate(
              {
                teamId: id,
                emails: emails.split(",").filter((x) => x !== ""),
                level,
              },
              {
                onSuccess: () => {
                  setEmails("")
                },
              },
            )
          }}
        >
          <TextInput
            className="mb-4"
            value={emails}
            name="emails"
            onChange={(e) => {
              setEmails(e.target.value)
            }}
            placeholder="emails seperated by commas • j@example.com,hey@example.com"
          />
          {ROLES.map((role, index) => (
            <label key={index} className="flex items-center pb-4">
              <RadioButton
                className="mr-2"
                name="level"
                checked={level === role.value}
                value={role.value}
                onChange={(e) => {
                  // eslint-disable-next-line @typescript-eslint/consistent-type-assertions
                  setLevel(e.target.value as "admin" | "contributor" | "read")
                }}
              />
              <div>
                <h4 className="text-base font-medium">{role.name}</h4>

                {/* eslint-disable-next-line react/forbid-elements */}
                <p className="text-[--color-text-muted]">{role.description}</p>
              </div>
            </label>
          ))}

          {/* eslint-disable-next-line react/forbid-elements */}
          <p className="mb-2">
            {/* eslint-disable-next-line react/forbid-elements */}
            <b>Note:</b> Users without an account will be sent an email asking
            to create one.
          </p>
          <Button
            type="submit"
            variant="primary"
            loading={sendInvites.isPending}
          >
            Send Invite
          </Button>
        </form>
      </div>
    </NavPage>
  )
}
