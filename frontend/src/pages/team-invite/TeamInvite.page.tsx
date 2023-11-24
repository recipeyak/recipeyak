import { useState } from "react"
import { Link, RouteComponentProps } from "react-router-dom"

import { Button } from "@/components/Buttons"
import { RadioButton, TextInput } from "@/components/Forms"
import { Helmet } from "@/components/Helmet"
import { NavPage } from "@/components/Page"
import { useTeam } from "@/queries/teamFetch"
import { useTeamInviteCreate } from "@/queries/teamInviteCreate"
import { teamURL } from "@/urls"

export const roles = [
  {
    name: "Admin",
    value: "admin",
    description: "Add and remove recipes, members.",
  },
  {
    name: "Contributor",
    value: "contributor",
    description: "Add and remove recipes and view all members.",
  },
  {
    name: "Viewer",
    value: "viewer",
    description: "View all team recipes and members.",
  },
]

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
    <NavPage>
      <div style={{ maxWidth: 800, marginLeft: "auto", marginRight: "auto" }}>
        <Helmet title="Team Invite" />
        <Link to={teamURL(id, teamInfo.data.name)}>
          <h1 className="fs-9 text-center fw-500 p-4">{teamInfo.data.name}</h1>
        </Link>
        <section className="d-flex justify-space-between align-items-center mb-2">
          <h2 className="fs-6">Invite Team Members</h2>
        </section>

        <form
          action=""
          className=""
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
          {roles.map((role, index) => (
            <label key={index} className="d-flex align-items-center pb-4">
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
                <h4 className="fs-4 fw-500">{role.name}</h4>
                <p className="text-muted">{role.description}</p>
              </div>
            </label>
          ))}
          <p className="mb-2">
            <b>Note:</b> Users without an account will be sent an email asking
            to create one.
          </p>
          <Button
            type="submit"
            variant="primary"
            loading={sendInvites.isPending}
            className="justify-self-left"
          >
            Send Invite
          </Button>
        </form>
      </div>
    </NavPage>
  )
}
