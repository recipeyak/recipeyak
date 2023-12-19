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
import {
  pathLogin,
  pathPassword,
  pathRecipesExportJson,
  pathRecipesExportYaml,
} from "@/paths"
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
      <label className="text-xl font-bold">Export</label>
      <a href={pathRecipesExportYaml({})}>recipes.yaml</a>
      <a href={pathRecipesExportJson({})}>recipes.json</a>
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
      <label className="text-xl font-bold">Danger Zone</label>
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
        const theme = THEME_META[themeId]
        return (
          <label
            key={themeId}
            className="flex min-w-min cursor-pointer flex-col  items-start rounded-md bg-[var(--color-background-calendar-day)]"
            style={{
              border: "1px solid var(--color-border)",
            }}
          >
            <RecipeDetailSkeleton fgFill={theme.fgFill} bgFill={theme.bgFill} />
            <div className="flex w-full items-center gap-1 border-[0] border-t border-solid border-[var(--color-border)] p-2 px-3">
              <RadioButton
                className="mr-1"
                checked={themeId === props.value}
                onClick={() => {
                  props.onChange(themeId)
                }}
              />
              <span className="font-medium">{theme.displayName}</span>
            </div>
          </label>
        )
      })}
    </>
  )
}

const RecipeDetailSkeleton = ({
  bgFill,
  fgFill,
}: {
  bgFill: string
  fgFill: string
}) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width={270}
    height={168}
    fill="none"
    className="rounded-md rounded-b-[0]"
  >
    <path fill={bgFill} d="M0 0h270v168H0z" />
    <path
      fill={fgFill}
      fillOpacity={0.5}
      d="M15 41.086a4.233 4.233 0 0 1 4.235-4.23h54.353a4.233 4.233 0 0 1 4.236 4.23v.705a4.233 4.233 0 0 1-4.236 4.23H19.235A4.233 4.233 0 0 1 15 41.792v-.705ZM15 55.187a4.233 4.233 0 0 1 4.235-4.23h87.53a4.233 4.233 0 0 1 4.235 4.23v.705a4.233 4.233 0 0 1-4.235 4.23h-87.53A4.233 4.233 0 0 1 15 55.892v-.705ZM15 69.993a4.233 4.233 0 0 1 4.235-4.23H75a4.233 4.233 0 0 1 4.235 4.23A4.233 4.233 0 0 1 75 74.223H19.235A4.233 4.233 0 0 1 15 69.993ZM127.941 113a3.527 3.527 0 0 1 3.53-3.525h42.353a3.527 3.527 0 0 1 3.529 3.525 3.527 3.527 0 0 1-3.529 3.525h-42.353a3.527 3.527 0 0 1-3.53-3.525ZM15 113a3.527 3.527 0 0 1 3.53-3.525h43.058c1.95 0 3.53 1.578 3.53 3.525a3.527 3.527 0 0 1-3.53 3.525H18.53A3.527 3.527 0 0 1 15 113ZM15 122.87c0-1.168.948-2.115 2.118-2.115h91.764a2.116 2.116 0 1 1 0 4.231H17.118A2.117 2.117 0 0 1 15 122.87ZM15 136.971c0-1.168.948-2.115 2.118-2.115H51c1.17 0 2.118.947 2.118 2.115A2.116 2.116 0 0 1 51 139.086H17.118A2.116 2.116 0 0 1 15 136.971ZM15 143.317c0-1.169.948-2.116 2.118-2.116h91.764a2.117 2.117 0 1 1 0 4.231H17.118A2.116 2.116 0 0 1 15 143.317ZM15 150.367c0-1.168.948-2.115 2.118-2.115h70.588c1.17 0 2.117.947 2.117 2.115a2.116 2.116 0 0 1-2.117 2.115H17.118A2.116 2.116 0 0 1 15 150.367ZM15 157.417c0-1.168.948-2.115 2.118-2.115h91.764c1.17 0 2.118.947 2.118 2.115a2.116 2.116 0 0 1-2.118 2.115H17.118A2.116 2.116 0 0 1 15 157.417ZM15 129.921c0-1.168.948-2.115 2.118-2.115h79.764c1.17 0 2.118.947 2.118 2.115a2.116 2.116 0 0 1-2.118 2.115H17.118A2.116 2.116 0 0 1 15 129.921ZM15 87.619c0-1.168.948-2.115 2.118-2.115h40.94c1.17 0 2.118.947 2.118 2.115a2.116 2.116 0 0 1-2.117 2.115H17.118A2.116 2.116 0 0 1 15 87.619ZM15 21.345c0-1.168.948-2.115 2.118-2.115h17.647c1.17 0 2.117.947 2.117 2.115a2.116 2.116 0 0 1-2.117 2.115H17.118A2.116 2.116 0 0 1 15 21.345ZM15 93.964c0-1.168.948-2.115 2.118-2.115h55.764c1.17 0 2.118.947 2.118 2.115a2.116 2.116 0 0 1-2.118 2.115H17.118A2.116 2.116 0 0 1 15 93.964ZM127.941 129.921c0-1.168.948-2.115 2.118-2.115h101.647c1.169 0 2.118.947 2.118 2.115a2.117 2.117 0 0 1-2.118 2.115H130.059a2.116 2.116 0 0 1-2.118-2.115ZM127.941 136.971c0-1.168.948-2.115 2.118-2.115h91.765a2.116 2.116 0 1 1 0 4.23h-91.765a2.116 2.116 0 0 1-2.118-2.115ZM127.941 122.87c0-1.168.948-2.115 2.118-2.115h91.765a2.116 2.116 0 1 1 0 4.231h-91.765a2.117 2.117 0 0 1-2.118-2.116ZM127.941 154.597c0-1.168.948-2.115 2.118-2.115H231.706c1.169 0 2.118.947 2.118 2.115a2.117 2.117 0 0 1-2.118 2.115H130.059a2.116 2.116 0 0 1-2.118-2.115ZM127.941 147.547c0-1.168.948-2.115 2.118-2.115h91.765a2.116 2.116 0 1 1 0 4.23h-91.765a2.116 2.116 0 0 1-2.118-2.115ZM127.941 19.23a4.233 4.233 0 0 1 4.235-4.23h118.589A4.233 4.233 0 0 1 255 19.23v80.374a4.233 4.233 0 0 1-4.235 4.231H132.176a4.233 4.233 0 0 1-4.235-4.23V19.23ZM127.941 161.647c0-1.168.948-2.115 2.118-2.115h91.765a2.116 2.116 0 1 1 0 4.231h-91.765a2.117 2.117 0 0 1-2.118-2.116Z"
    />
  </svg>
)

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
      <BetterLabel className="text-xl">Theme</BetterLabel>
      <div className="flex flex-col gap-2">
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
          <div className="my-2 grid grid-cols-[repeat(3,_1fr)] gap-3">
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
          <div className="flex space-x-5">
            <div className="grid gap-2">
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
            <div className="grid gap-2">
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
