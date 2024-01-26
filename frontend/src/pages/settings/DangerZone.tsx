import { useQueryClient } from "@tanstack/react-query"
import { AxiosError } from "axios"
import { useState } from "react"
import { DialogTrigger } from "react-aria-components"
import { useHistory } from "react-router-dom"

import { logout } from "@/auth"
import { Box } from "@/components/Box"
import { Button } from "@/components/Buttons"
import { Modal } from "@/components/Modal"
import { TextInput } from "@/components/TextInput"
import { pathLogin } from "@/paths"
import { useUserDelete } from "@/queries/userDelete"
import { toast } from "@/toast"

export function DangerZone() {
  const deleteUser = useUserDelete()
  const history = useHistory()
  const queryClient = useQueryClient()
  const deleteUserAccount = () => {
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
  const [value, setValue] = useState("")
  return (
    <Box dir="col" align="start" gap={1}>
      <label className="text-xl font-bold">Danger Zone</label>
      <DialogTrigger>
        <Button size="small" variant="danger">
          Permanently Delete My Account
        </Button>
        <Modal title={"Delete Your Account"}>
          <div className="flex flex-col gap-2">
            <div>Are you sure you want to permanently delete your account?</div>
            <div>
              Please type, 'delete my account', to irrevocably delete your
              account
            </div>
            <TextInput
              value={value}
              onChange={(e) => {
                setValue(e.target.value)
              }}
            />
            <div className="flex gap-2">
              <Button>Cancel</Button>
              <Button
                variant="danger"
                loading={deleteUser.isPending}
                onClick={() => {
                  if (value.toLowerCase() !== "delete my account") {
                    toast.error("Please type 'delete my account'")
                    setValue("")
                  } else {
                    deleteUserAccount()
                  }
                }}
              >
                Delete
              </Button>
            </div>
          </div>
        </Modal>
      </DialogTrigger>
    </Box>
  )
}
