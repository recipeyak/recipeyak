import React, { useState } from "react"

import { Button } from "@/components/Buttons"
import { NavPage } from "@/components/Page"
import { RadioButton } from "@/components/RadioButton"
import { TextInput } from "@/components/TextInput"
import { ROLES } from "@/pages/team-invite/teamConstants"
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
    <NavPage title="Create a Team">
      <div className="mx-auto max-w-[800px]">
        <h1 className="text-4xl">Create Team</h1>
        <form action="" onSubmit={handleSubmit}>
          <label className="mb-3 flex items-center">
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
            <h2 className="text-2xl">Invite Team Members</h2>

            <TextInput
              className="mb-4"
              value={emails}
              name="emails"
              onChange={(e) => {
                setEmails(e.target.value)
              }}
              placeholder="emails seperated by commas • j@example.com,hey@example.com"
            />
            {ROLES.map(({ name, value, description }, id) => (
              <label key={id} className="flex items-center pb-4">
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
                  <h4 className="text-base font-medium">{name}</h4>

                  {/* eslint-disable-next-line react/forbid-elements */}
                  <p className="text-[--color-text-muted]">{description}</p>
                </div>
              </label>
            ))}
            <div className="mb-2">
              {/* eslint-disable-next-line react/forbid-elements */}
              <b>Note:</b> Users without an account will be sent an email asking
              to create one.
            </div>
          </div>

          <Button
            type="submit"
            variant="primary"
            loading={teamCreate.isPending}
          >
            Create Team
          </Button>
        </form>
      </div>
    </NavPage>
  )
}
