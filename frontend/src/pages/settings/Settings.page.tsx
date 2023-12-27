import { Avatar } from "@/components/Avatar"
import { Box } from "@/components/Box"
import { Helmet } from "@/components/Helmet"
import { Loader } from "@/components/Loader"
import { NavPage } from "@/components/Page"
import { ChangeEmail } from "@/pages/settings/ChangeEmail"
import { Export } from "@/pages/settings/Export"
import Sessions from "@/pages/settings/Sessions"
import { ThemePicker } from "@/pages/settings/ThemePicker"
import { useUserFetch } from "@/queries/userFetch"

import { ChangeName } from "./ChangeName"
import { ChangePassword } from "./ChangePassword"
import { ChangeTeam } from "./ChangeTeam"
import { DangerZone } from "./DangerZone"

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

        <Box dir="col" align="start" className="gap-2">
          <div className="flex flex-col gap-2">
            <Avatar avatarURL={userInfo.data.avatar_url} size={72} />
            <a
              href="https://secure.gravatar.com"
              className="self-start rounded-md border border-solid border-[var(--color-border)] bg-[var(--color-background-card)] px-2 py-1 text-xs font-medium"
            >
              Change profile picture
            </a>
          </div>
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
