import { useQueryClient } from "@tanstack/react-query"
import { AxiosError } from "axios"
import React, { useState } from "react"
import { Link, useHistory } from "react-router-dom"

import { logout } from "@/auth"
import { Box } from "@/components/Box"
import { Button } from "@/components/Buttons"
import { Select, TextInput } from "@/components/Forms"
import { Helmet } from "@/components/Helmet"
import { BetterLabel } from "@/components/Label"
import { Loader } from "@/components/Loader"
import { NavPage } from "@/components/Page"
import { Export } from "@/pages/settings/Export"
import Sessions from "@/pages/settings/Sessions"
import { ThemePicker } from "@/pages/settings/ThemePicker"
import { pathLogin, pathPassword, pathSchedule } from "@/paths"
import { useTeamList } from "@/queries/teamList"
import { useUserDelete } from "@/queries/userDelete"
import { useUserFetch } from "@/queries/userFetch"
import { useUserUpdate } from "@/queries/userUpdate"
import { toast } from "@/toast"
import { useTeamId } from "@/useTeamId"

function DangerZone() {
  const deleteUser = useUserDelete()
  const history = useHistory()
  const queryClient = useQueryClient()
  const deleteUserAccount = () => {
    const response = prompt(
      "Are you sure you want to permanently delete your account? \nPlease type, 'delete my account', to irrevocably delete your account",
    )
    if (response != null && response.toLowerCase() === "delete my account") {
      deleteUser.mutate(undefined, {
        onSuccess: () => {
          logout(queryClient)
          history.push(pathLogin({}))
          toast("Account deleted")
        },
        onError: (error: unknown) => {
          // eslint-disable-next-line @typescript-eslint/consistent-type-assertions
          const err = error as AxiosError | undefined
          if (err == null) {
            return
          }
          if (
            err.response?.status === 403 &&
            // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
            err.response.data.detail
          ) {
            // eslint-disable-next-line @typescript-eslint/no-unsafe-argument, @typescript-eslint/no-unsafe-member-access
            toast.error(err.response.data.detail)
          } else {
            toast.error("failed to delete account")
          }
        },
      })
    }
  }
  return (
    <Box dir="col" align="start" gap={1}>
      <label className="text-xl font-bold">Danger Zone</label>
      <Button size="small" onClick={deleteUserAccount} variant="danger">
        permanently delete my account
      </Button>
    </Box>
  )
}

function ProfileImg({ avatarURL }: { avatarURL: string }) {
  return (
    <a href="https://secure.gravatar.com" className="mr-3 justify-self-center">
      <img
        width="72px"
        height="72px"
        alt="user profile"
        className="rounded-md"
        src={avatarURL + "&s=72"}
      />
    </a>
  )
}

function ChangeTeam() {
  const queryClient = useQueryClient()
  const history = useHistory()
  const value = useTeamId()

  const onChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const teamID = parseInt(e.target.value, 10)
    // TODO: instead of navigating to the schedule page we should update the
    // path param of the current route if there is a teamID in it.
    // Maybe we can get rid of the teamID from the URL entirely?
    const url = pathSchedule({ teamId: teamID.toString() })
    // navTo is async so we can't count on the URL to have changed by the time we refetch the data
    history.push(url)
    // TODO: we should abstract this -- it's hacky
    void queryClient.invalidateQueries({
      queryKey: [teamID],
    })
    void queryClient.invalidateQueries({
      queryKey: ["user-detail"],
    })
  }
  const teams = useTeamList()
  return (
    <div className="flex flex-col gap-1">
      <BetterLabel>Team</BetterLabel>
      <Select onChange={onChange} value={value} disabled={teams.isPending}>
        {teams.isSuccess
          ? teams.data.map((t) => (
              <option key={t.id} value={t.id}>
                {t.name} (current)
              </option>
            ))
          : null}
      </Select>
    </div>
  )
}

function EmailEditForm(props: { email: string }) {
  const updateEmail = useUserUpdate()
  const [email, setEmail] = useState("")
  const [isEditing, setIsEditing] = useState(false)
  const cancelEdit = () => {
    setEmail(props.email)
    setIsEditing(false)
  }
  return (
    <form
      className="flex flex-col"
      onSubmit={(e) => {
        e.preventDefault()
        updateEmail.mutate(
          {
            email,
          },
          {
            onSuccess: () => {
              setIsEditing(false)
              toast.success("updated email")
            },
            onError: (error) => {
              // eslint-disable-next-line @typescript-eslint/consistent-type-assertions
              const err = error as AxiosError | undefined
              // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-call
              const messageExtra = err?.response?.data.email?.[0].includes(
                "email already exists",
              )
                ? "- email already in use"
                : ""
              toast.error(`problem updating email ${messageExtra}`)
            },
          },
        )
      }}
    >
      <Box dir="col">
        <BetterLabel>Email</BetterLabel>
        <Box gap={2}>
          {isEditing ? (
            <TextInput
              onKeyDown={(e) => {
                if (e.key === "Escape") {
                  cancelEdit()
                }
              }}
              autoFocus
              defaultValue={props.email}
              onChange={(e) => {
                setEmail(e.target.value)
              }}
              name="email"
            />
          ) : (
            <span>{props.email}</span>
          )}
          {isEditing ? (
            <Box gap={2}>
              <Button
                disabled={updateEmail.isPending}
                name="email"
                size="small"
                onClick={() => {
                  cancelEdit()
                }}
                value="save email"
              >
                Cancel
              </Button>
              <Button
                variant="primary"
                size="small"
                name="email"
                type="submit"
                loading={updateEmail.isPending}
                value="save email"
              >
                Save
              </Button>
            </Box>
          ) : (
            <Button
              size="small"
              onClick={() => {
                setIsEditing(true)
              }}
            >
              Edit
            </Button>
          )}
        </Box>
      </Box>
    </form>
  )
}

function NameForm(props: { initialValue: string }) {
  const [editing, setEditing] = React.useState(false)
  const [name, setName] = React.useState(props.initialValue)
  const updateUser = useUserUpdate()
  function cancelEdit() {
    setEditing(false)
    setName(props.initialValue)
  }
  React.useEffect(() => {
    setName(props.initialValue)
  }, [props.initialValue])
  return (
    <form
      className="flex items-center"
      onSubmit={(e) => {
        e.preventDefault()
        updateUser.mutate(
          { name },
          {
            onSuccess: () => {
              setEditing(false)
            },
            onError: () => {
              toast.error("failed to update name")
            },
          },
        )
      }}
    >
      <Box dir="col">
        <BetterLabel>Name</BetterLabel>
        <Box gap={2}>
          {editing ? (
            <TextInput
              onKeyDown={(e) => {
                if (e.key === "Escape") {
                  cancelEdit()
                }
              }}
              autoFocus
              defaultValue={name}
              onChange={(val) => {
                setName(val.target.value)
              }}
            />
          ) : (
            <span>{name}</span>
          )}
          {editing ? (
            <Box gap={2}>
              <Button type="button" size="small" onClick={cancelEdit}>
                Cancel
              </Button>
              <Button variant="primary" size="small" type="submit">
                Save
              </Button>
            </Box>
          ) : (
            <Button
              size="small"
              onClick={() => {
                setEditing((s) => !s)
              }}
            >
              Edit
            </Button>
          )}
        </Box>
      </Box>
    </form>
  )
}

function ChangePassword() {
  return (
    <Box dir="col" className="gap-1">
      <BetterLabel>Password</BetterLabel>
      <Link
        to={pathPassword({})}
        className="self-start rounded-md border border-solid border-[var(--color-border)] bg-[var(--color-background-card)] px-2 py-1 text-sm font-medium"
      >
        Change Password
      </Link>
    </Box>
  )
}

export function SettingsPage() {
  const userInfo = useUserFetch()

  if (!userInfo.isSuccess) {
    return (
      <NavPage>
        <Loader />
      </NavPage>
    )
  }

  return (
    <NavPage>
      <Box
        style={{
          maxWidth: 800,
          marginLeft: "auto",
          marginRight: "auto",
        }}
        dir="col"
        gap={4}
      >
        <Helmet title="Settings" />

        <h1 className="text-3xl">User settings</h1>

        <Box dir="col" align="start">
          <ProfileImg avatarURL={userInfo.data.avatar_url} />

          <Box dir="col" style={{ maxWidth: 400 }} gap={2}>
            <EmailEditForm email={userInfo.data.email} />
            <NameForm initialValue={userInfo.data.name} />
            <ChangeTeam />
            <ChangePassword />
          </Box>
        </Box>
        <ThemePicker />

        <Export />
        <Sessions />
        <DangerZone />
      </Box>
    </NavPage>
  )
}
