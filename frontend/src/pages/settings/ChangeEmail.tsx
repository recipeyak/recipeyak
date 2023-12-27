import { AxiosError } from "axios"
import { useState } from "react"

import { Box } from "@/components/Box"
import { Button } from "@/components/Buttons"
import { TextInput } from "@/components/Forms"
import { BetterLabel } from "@/components/Label"
import { useUserUpdate } from "@/queries/userUpdate"
import { toast } from "@/toast"

export function ChangeEmail(props: { email: string }) {
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
      <Box dir="col" className="items-start">
        <BetterLabel>Email</BetterLabel>
        <div className="flex flex-col items-start gap-1">
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
          </Box>
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
              Change email
            </Button>
          )}
        </div>
      </Box>
    </form>
  )
}
