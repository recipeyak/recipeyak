import React from "react"

import { Button } from "@/components/Buttons"
import { BetterLabel } from "@/components/Label"
import { TextInput } from "@/components/TextInput"
import { useUserUpdate } from "@/queries/useUserUpdate"
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
      <div className="flex flex-col">
        <BetterLabel>Name</BetterLabel>
        <div className="flex flex-col items-start gap-1">
          <div className="flex gap-2">
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
          </div>
          {editing ? (
            <div className="flex gap-1">
              <Button type="button" size="small" onClick={cancelEdit}>
                Cancel
              </Button>
              <Button variant="primary" size="small" type="submit">
                Update Name
              </Button>
            </div>
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
      </div>
    </form>
  )
}
