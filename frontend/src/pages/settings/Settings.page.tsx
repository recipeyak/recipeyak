import { useQueryClient } from "@tanstack/react-query"
import produce from "immer"
import { FileTrigger } from "react-aria-components"

import { Avatar } from "@/components/Avatar"
import { Box } from "@/components/Box"
import { Button } from "@/components/Buttons"
import { Loader } from "@/components/Loader"
import { NavPage } from "@/components/Page"
import { ChangeEmail } from "@/pages/settings/ChangeEmail"
import { ChangeName } from "@/pages/settings/ChangeName"
import { ChangePassword } from "@/pages/settings/ChangePassword"
import { ChangeTeam } from "@/pages/settings/ChangeTeam"
import { DangerZone } from "@/pages/settings/DangerZone"
import { Export } from "@/pages/settings/Export"
import Sessions from "@/pages/settings/Sessions"
import { ThemePicker } from "@/pages/settings/ThemePicker"
import { useUploadCreate } from "@/queries/uploadCreate"
import { cacheUpsertUser, useUserFetch } from "@/queries/userFetch"
import { toast } from "@/toast"

export function SettingsPage() {
  const userInfo = useUserFetch()
  const queryClient = useQueryClient()
  const uploadCreate = useUploadCreate()

  if (!userInfo.isSuccess) {
    return (
      <NavPage title="Settings">
        <Loader />
      </NavPage>
    )
  }

  return (
    <NavPage title="Settings">
      <Box
        // eslint-disable-next-line no-restricted-syntax
        style={{
          maxWidth: 800,
          marginLeft: "auto",
          marginRight: "auto",
        }}
        dir="col"
        gap={4}
      >
        <h1 className="text-3xl">User settings</h1>

        <Box dir="col" align="start" className="gap-2">
          <div className="flex flex-col gap-2">
            <Avatar avatarURL={userInfo.data.avatar_url} size={72} />
            <FileTrigger
              acceptedFileTypes={["image/jpeg", "image/png"]}
              onSelect={(e) => {
                if (e == null) {
                  return
                }
                let files = Array.from(e)
                const file = files[0]
                // TODO: we should open this in a modal that:
                // 1. allows adjustments
                // 2. allows previewing of what it will look like
                uploadCreate.mutate(
                  {
                    file,
                    purpose: "profile",
                  },
                  {
                    onSuccess: (res) => {
                      // NOTE: there are other places in the cache that we
                      // should update (since it isn't normalized), but this is
                      // good enough
                      cacheUpsertUser(queryClient, {
                        updater: (prev) => {
                          if (prev == null) {
                            return prev
                          }
                          return produce(prev, (draft) => {
                            draft.avatar_url = res.url
                          })
                        },
                      })
                    },
                    onError: () => {
                      toast.error("problem changing profile picture")
                    },
                  },
                )
              }}
            >
              <Button size="small">
                {!uploadCreate.isPending
                  ? "Change profile picture"
                  : "Changing profile picture..."}
              </Button>
            </FileTrigger>
          </div>

          {/* eslint-disable-next-line no-restricted-syntax */}
          <Box dir="col" style={{ maxWidth: 400 }} gap={2}>
            <ChangeEmail email={userInfo.data.email} />
            <ChangeName initialValue={userInfo.data.name} />
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
