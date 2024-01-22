import { Menu, MenuTrigger, Separator } from "react-aria-components"
import { Link } from "react-router-dom"

import { useIsLoggedIn } from "@/auth"
import { Avatar } from "@/components/Avatar"
import { Button } from "@/components/Buttons"
import Logo from "@/components/Logo"
import { MenuItem } from "@/components/MenuItem"
import { MenuPopover } from "@/components/MenuPopover"
import { NavLink } from "@/components/NavLink"
import { NavRecipeSearch } from "@/components/NavRecipeSearch"
import {
  pathHome,
  pathLogin,
  pathProfileById,
  pathRecipeAdd,
  pathRecipesList,
  pathSchedule,
  pathSettings,
  pathSignup,
  pathTeamList,
} from "@/paths"
import { useAuthLogout } from "@/queries/authLogout"
import { useTeam } from "@/queries/teamFetch"
import { useTeamId } from "@/useTeamId"
import { useUser } from "@/useUser"

function UserDropdown() {
  const user = useUser()

  const logoutUser = useAuthLogout()

  const menuItems: Array<
    | { type: "menuitem"; label: string; to: string; onClick?: undefined }
    | { type: "menuitem"; label: string; to?: undefined; onClick: () => void }
    | { type: "separator"; id: string }
  > = [
    {
      type: "menuitem",
      label: "Profile",
      to: pathProfileById({ userId: String(user.id) }),
    },
    {
      type: "menuitem",
      label: "Settings",
      to: pathSettings({}),
    },
    {
      type: "menuitem",
      label: "Teams",
      to: pathTeamList({}),
    },
    {
      type: "separator",
      id: "separator-1",
    },
    {
      type: "menuitem",
      label: "Logout",
      onClick: () => {
        logoutUser.mutate()
      },
    },
  ]

  const teamId = useTeamId()
  const team = useTeam({ teamId })

  return (
    <MenuTrigger>
      <Button className="!rounded-full !border-none !p-0">
        <Avatar avatarURL={user.avatarURL} />
      </Button>
      <MenuPopover>
        <Menu
          className="outline-none"
          onAction={(key) => {
            const metadata = menuItems.find(
              (x) => x.type === "menuitem" && x.label === key,
            )
            if (metadata?.type === "menuitem") {
              metadata.onClick?.()
            }
          }}
          disabledKeys={["meta-info"]}
        >
          <MenuItem id="meta-info" isInfo>
            <div className="pb-1 ">
              <span>{user.name ?? user.email}</span>
              <span> · </span>
              <span className="text-sm ">{team.data?.name}</span>
              <div className="text-sm ">{user.email}</div>
            </div>
          </MenuItem>
          <Separator className="my-1 h-[1px] bg-[--color-border]" />
          {menuItems.map((menuItem) => {
            if (menuItem.type === "separator") {
              return (
                <Separator
                  id={menuItem.id}
                  key={menuItem.id}
                  className="my-1 h-[1px] bg-[--color-border]"
                />
              )
            }
            return (
              <MenuItem
                id={menuItem.label}
                key={menuItem.label}
                href={menuItem.to}
              >
                {menuItem.label}
              </MenuItem>
            )
          })}
        </Menu>
      </MenuPopover>
    </MenuTrigger>
  )
}

function WordMark() {
  return <span className="hidden text-2xl sm:block">Recipe Yak</span>
}

function AuthButtons() {
  return (
    <div className="flex justify-self-end">
      <NavLink to={pathLogin({})}>Login</NavLink>
      <NavLink to={pathSignup({})}>Signup</NavLink>
    </div>
  )
}

function NavButtons() {
  return (
    <div className="relative flex items-center justify-center gap-2 justify-self-end">
      <div className="flex print:!hidden sm:gap-2">
        <NavLink to={pathRecipeAdd({})}>Add</NavLink>
        <NavLink to={pathRecipesList({})}>Browse</NavLink>
        <NavLink to={pathSchedule({})}>Calendar</NavLink>
      </div>

      <UserDropdown />
    </div>
  )
}

export function Navbar({ includeSearch = true }: { includeSearch?: boolean }) {
  const isLoggedIn = useIsLoggedIn()
  return (
    <nav className="flex h-[3.5rem] shrink-0 justify-between gap-1 px-3 pb-1 print:!hidden md:grid md:grid-cols-3">
      <div className="flex items-center justify-start gap-2">
        <Link
          to={pathHome({})}
          className={
            "flex shrink-0 grow-0 cursor-pointer items-center justify-center rounded-md"
          }
        >
          <Logo width="40px" />
        </Link>
        <NavLink
          to={pathHome({})}
          className="hidden sm:block"
          noActiveState={!isLoggedIn}
        >
          {isLoggedIn ? (
            <span className="font-medium ">Home</span>
          ) : (
            <WordMark />
          )}
        </NavLink>
      </div>
      <div className="flex grow items-center">
        {includeSearch && <NavRecipeSearch />}
      </div>
      {isLoggedIn ? <NavButtons /> : <AuthButtons />}
    </nav>
  )
}
