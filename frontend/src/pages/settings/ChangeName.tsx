import React from "react"

import { Box } from "@/components/Box"
import { Button } from "@/components/Buttons"
import { TextInput } from "@/components/Forms"
import { BetterLabel } from "@/components/Label"
import { useUserUpdate } from "@/queries/userUpdate"
import { toast } from "@/toast"

export function ChangeName(props: { initialValue: string }) {
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
        <div className="flex flex-col items-start gap-1">
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
          </Box>
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
              Change name
            </Button>
          )}
        </div>
      </Box>
    </form>
  )
}
