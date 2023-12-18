import { useQueryClient } from "@tanstack/react-query"
import { AxiosError } from "axios"
import React, { useState } from "react"
import { Link, useHistory } from "react-router-dom"

import { logout } from "@/auth"
import { Box } from "@/components/Box"
import { Button } from "@/components/Buttons"
import { RadioButton, Select, TextInput } from "@/components/Forms"
import { Helmet } from "@/components/Helmet"
import { BetterLabel } from "@/components/Label"
import { Loader } from "@/components/Loader"
import { NavPage } from "@/components/Page"
import Sessions from "@/pages/settings/Sessions"
import { pathLogin, pathPassword } from "@/paths"
import { useUserDelete } from "@/queries/userDelete"
import { useUserFetch } from "@/queries/userFetch"
import { useUserUpdate } from "@/queries/userUpdate"
import { themeSet } from "@/theme"
import { Theme, THEME_IDS, THEME_META, ThemeMode } from "@/themeConstants"
import { toast } from "@/toast"
import { useUserTheme } from "@/useUserTheme"

function Export() {
  return (
    <Box dir="col">
      <label className="font-bold">Export</label>
      <p>
        {/* TODO: figure out how to type check these routes */}
        <a href="/recipes.yaml">recipes.yaml</a>
      </p>
      <p>
        {/* TODO: figure out how to type check these routes */}
        <a href="/recipes.json">recipes.json</a>
      </p>
    </Box>
  )
}

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
      <label className="font-bold">Danger Zone</label>
      <Button size="small" onClick={deleteUserAccount} variant="danger">
        permanently delete my account
      </Button>
    </Box>
  )
}

interface IProfileImgProps {
  readonly avatarURL: string
}
function ProfileImg({ avatarURL }: IProfileImgProps) {
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

interface IEmailEditForm {
  readonly email: string
}

function EmailEditForm(props: IEmailEditForm) {
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
    <Box dir="col">
      <BetterLabel>Password</BetterLabel>
      <Link to={pathPassword({})}>Change Password</Link>
    </Box>
  )
}

function ThemeList(props: { value: Theme; onChange: (value: Theme) => void }) {
  return (
    <>
      {THEME_IDS.map((themeId) => {
        return (
          <label
            key={themeId}
            className="flex cursor-pointer items-center rounded-md p-2"
            style={{
              border: "1px solid var(--color-border)",
            }}
          >
            <RadioButton
              className="mr-1"
              checked={themeId === props.value}
              onClick={() => {
                props.onChange(themeId)
              }}
            />
            {THEME_META[themeId].displayName}
          </label>
        )
      })}
    </>
  )
}

function ThemePicker() {
  const updateUser = useUserUpdate()
  const theme = useUserTheme()

  const [formState, setFormState] = useState<{
    day: Theme
    night: Theme
    mode: ThemeMode
  }>(theme)

  const updateTheme = (args: { day: Theme; night: Theme; mode: ThemeMode }) => {
    setFormState(args)
    themeSet(args)
    updateUser.mutate(
      { theme_day: args.day, theme_night: args.night, theme_mode: args.mode },
      {
        onError: () => {
          setFormState(args)
          themeSet(args)
        },
      },
    )
  }

  return (
    <Box dir="col" align="start">
      <BetterLabel>Theme</BetterLabel>
      <div className="flex flex-col gap-2 rounded-md border border-solid border-[var(--color-border)] bg-[var(--color-background-calendar-day)] p-4">
        <div className="flex flex-col">
          <BetterLabel htmlFor="theme_mode">Mode</BetterLabel>
          <Select
            id="theme_mode"
            onChange={(e) => {
              // eslint-disable-next-line @typescript-eslint/consistent-type-assertions
              const mode = e.target.value as ThemeMode
              updateTheme({ day: formState.day, night: formState.night, mode })
            }}
            value={formState.mode}
          >
            <option value="single">Single theme</option>
            <option value="sync_with_system">Sync with system</option>
          </Select>
        </div>

        {formState.mode === "single" && (
          <div className="my-2 grid gap-1">
            <ThemeList
              value={formState.day}
              onChange={(day) => {
                updateTheme({
                  day,
                  night: formState.night,
                  mode: formState.mode,
                })
              }}
            />
          </div>
        )}
        {formState.mode === "sync_with_system" && (
          <div className="flex space-x-10">
            <div className="grid gap-1">
              <BetterLabel>Day Theme</BetterLabel>

              <ThemeList
                value={formState.day}
                onChange={(day) => {
                  updateTheme({
                    day,
                    night: formState.night,
                    mode: formState.mode,
                  })
                }}
              />
            </div>
            <div className="grid gap-1">
              <BetterLabel>Night Theme</BetterLabel>

              <ThemeList
                value={formState.night}
                onChange={(night) => {
                  updateTheme({
                    day: formState.day,
                    night,
                    mode: formState.mode,
                  })
                }}
              />
            </div>
          </div>
        )}
      </div>
    </Box>
  )
}

export function SettingsPage() {
  const userInfo = useUserFetch()

  if (!userInfo.isSuccess) {
    return <Loader />
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
