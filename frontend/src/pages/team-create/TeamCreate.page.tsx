import React, { useState } from "react"

import { Button } from "@/components/Buttons"
import { RadioButton, TextInput } from "@/components/Forms"
import { roles } from "@/pages/team-invite/TeamInvite.page"
import { useTeamCreate } from "@/queries/teamCreate"

export function TeamCreatePage() {
  const [name, setName] = useState("")
  const [emails, setEmails] = useState("")
  const [level, setLevel] = useState<"admin" | "contributor" | "read">(
    "contributor",
  )
  const teamCreate = useTeamCreate()
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const emailsList = emails.split(",").filter((x) => x !== "")
    teamCreate.mutate({ name, emails: emailsList, level })
  }

  return (
    <div style={{ maxWidth: 800, marginLeft: "auto", marginRight: "auto" }}>
      <h1 className="fs-9">Create Team</h1>
      <form action="" onSubmit={handleSubmit}>
        <label className="d-flex align-center mb-3">
          Name
          <TextInput
            value={name}
            onChange={(e) => {
              setName(e.target.value)
            }}
            className="ml-2"
            placeholder="A Great Team Name"
            name="name"
          />
        </label>

        <div>
          <h2 className="fs-6">Invite Team Members</h2>

          <TextInput
            className="mb-4"
            value={emails}
            name="emails"
            onChange={(e) => {
              setEmails(e.target.value)
            }}
            placeholder="emails seperated by commas • j@example.com,hey@example.com"
          />
          {roles.map(({ name, value, description }, id) => (
            <label key={id} className="d-flex align-items-center pb-4">
              <RadioButton
                className="mr-2"
                name="level"
                checked={level === value}
                value={value}
                onChange={(e) => {
                  // eslint-disable-next-line @typescript-eslint/consistent-type-assertions
                  setLevel(e.target.value as "admin" | "contributor" | "read")
                }}
              />
              <div>
                <h4 className="fs-4 fw-500">{name}</h4>
                <p className="text-muted">{description}</p>
              </div>
            </label>
          ))}
          <p className="mb-2">
            <b>Note:</b> Users without an account will be sent an email asking
            to create one.
          </p>
        </div>

        <Button
          type="submit"
          variant="primary"
          loading={teamCreate.isPending}
          className="justify-self-left"
        >
          Create Team
        </Button>
      </form>
    </div>
  )
}
