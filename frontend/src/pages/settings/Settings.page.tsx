import { useQueryClient } from "@tanstack/react-query"
import { AxiosError } from "axios"
import React, { useState } from "react"
import { Link, useHistory } from "react-router-dom"

import { logout } from "@/auth"
import { Box } from "@/components/Box"
import { Button } from "@/components/Buttons"
import { TextInput } from "@/components/Forms"
import { Helmet } from "@/components/Helmet"
import { Loader } from "@/components/Loader"
import Sessions from "@/pages/settings/Sessions"
import { useUserDelete } from "@/queries/userDelete"
import { useUserFetch } from "@/queries/userFetch"
import { useUserUpdate } from "@/queries/userUpdate"
import { toast } from "@/toast"

function Export() {
  return (
    <>
      <h1 className="fs-6">Export</h1>
      <p>
        <a href="/recipes.yaml">recipes.yaml</a>
      </p>
      <p>
        <a href="/recipes.json">recipes.json</a>
      </p>
    </>
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
          history.push("/login")
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
    <>
      <h1 className="fs-6">Danger Zone</h1>
      <a onClick={deleteUserAccount} className="has-text-danger">
        permanently delete my account
      </a>
    </>
  )
}

interface IProfileImgProps {
  readonly avatarURL: string
}
function ProfileImg({ avatarURL }: IProfileImgProps) {
  return (
    <a href="https://secure.gravatar.com" className="justify-self-center mr-3">
      <img
        width="128px"
        height="128px"
        alt="user profile"
        className="br-5"
        src={avatarURL + "&s=128"}
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
      className="d-flex flex-column"
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
        <label className="better-label">Email</label>
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
                disabled={updateEmail.isLoading}
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
                loading={updateEmail.isLoading}
                value="save email"
              >
                Save
              </Button>
            </Box>
          ) : (
            <Button
              size="small"
              variant="secondary"
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
      className="d-flex align-center"
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
        <label className="better-label">Name</label>
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
              variant="secondary"
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
      <label className="better-label">Password</label>
      <Link to="/password" className="has-text-primary">
        Change Password
      </Link>
    </Box>
  )
}

function Settings() {
  const userInfo = useUserFetch()

  if (!userInfo.isSuccess) {
    return <Loader />
  }

  return (
    <div>
      <Helmet title="Settings" />

      <h1 className="fs-8">User settings</h1>

      <Box dir="col" align="start">
        <ProfileImg avatarURL={userInfo.data.avatar_url} />

        <Box dir="col" style={{ maxWidth: 400 }}>
          <EmailEditForm email={userInfo.data.email} />
          <NameForm initialValue={userInfo.data.name} />
          <ChangePassword />
        </Box>
      </Box>

      <Export />
      <Sessions />
      <DangerZone />
    </div>
  )
}

export default Settings
