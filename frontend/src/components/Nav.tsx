import { Calendar, HomeIcon, LayoutGridIcon, PlusIcon } from "lucide-react"
import { Menu, MenuTrigger, Separator } from "react-aria-components"

import { clx } from "@/classnames"
import { Avatar } from "@/components/Avatar"
import { Button } from "@/components/Buttons"
import { MenuItem } from "@/components/MenuItem"
import { MenuPopover } from "@/components/MenuPopover"
import { NavLink } from "@/components/NavLink"
import { NavRecipeSearch } from "@/components/NavRecipeSearch"
import {
  pathHome,
  pathProfileById,
  pathRecipeAdd,
  pathRecipesList,
  pathSchedule,
  pathSettings,
  pathTeamList,
} from "@/paths"
import { useAuthLogout } from "@/queries/useAuthLogout"
import { useTeam } from "@/queries/useTeamFetch"
import { notUndefined } from "@/typeguard"
import { useMedia } from "@/useMedia"
import { useSentryFeedback } from "@/useSentryFeedback"
import { useTeamId } from "@/useTeamId"
import { useUser } from "@/useUser"

function UserDropdown() {
  const user = useUser()

  const logoutUser = useAuthLogout()
  const feedback = useSentryFeedback()

  const menuItems = [
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
    feedback
      ? {
          type: "menuitem",
          label: "Send Feedback",
          onClick: async () => {
            await feedback.open()
          },
        }
      : null,
    {
      type: "menuitem",
      label: "Logout",
      onClick: () => {
        logoutUser.mutate()
      },
    },
  ].filter(notUndefined)

  const teamId = useTeamId()
  const team = useTeam({ teamId })

  return (
    <MenuTrigger>
      <Button className="col-start-3 col-end-4 !rounded-full !border-none !p-0">
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

function NavButtons({ size }: { size: number }) {
  const isSmallerOrGreater = useMedia("(min-width: 640px)")
  const items = (
    <>
      <NavLink
        to={pathRecipeAdd({})}
        className="col-start-3 col-end-4 flex-none"
      >
        <div className="flex items-center gap-1">
          <PlusIcon size={size} />
          <div className="hidden xl:block">Add Recipe</div>
        </div>
      </NavLink>

      <NavLink
        to={pathRecipesList({})}
        className="col-start-3 col-end-4 flex-none"
      >
        <div className="flex items-center gap-2">
          <LayoutGridIcon size={size} />
          <div className="hidden xl:block">Browse</div>
        </div>
      </NavLink>
      <NavLink
        to={pathSchedule({})}
        className="col-start-3 col-end-4 flex-none"
      >
        <div className="flex items-center gap-2">
          <Calendar size={size} />
          <div className="hidden xl:block">Calendar</div>
        </div>
      </NavLink>

      <UserDropdown />
    </>
  )
  if (isSmallerOrGreater) {
    return (
      <div className="col-start-3 flex justify-end gap-2 sm:gap-6">{items}</div>
    )
  }
  return items
}

export function Navbar({
  includeSearch = true,
  setShowRecipeSearch,
  triggerRef,
  className,
}: {
  includeSearch?: boolean
  setShowRecipeSearch: React.Dispatch<React.SetStateAction<boolean>>
  triggerRef: React.RefObject<HTMLButtonElement>
  className?: string
}) {
  const isSmallerOrGreater = useMedia("(min-width: 640px)")
  const size = isSmallerOrGreater ? 20 : 24
  return (
    <nav
      className={clx(
        "sticky bottom-0 z-[1000] flex h-[3.5rem] shrink-0 items-center justify-between gap-4 px-6 pb-1 backdrop-blur-[28.5px] print:!hidden sm:bottom-[unset] sm:z-[unset] sm:bg-[unset] sm:px-2 sm:pl-1 sm:backdrop-blur-[unset] md:grid md:grid-cols-3",
        className,
      )}
    >
      <NavLink
        to={pathHome({})}
        className="col-start-1 col-end-2 justify-self-start"
      >
        <div className="flex items-center gap-2">
          <HomeIcon size={size} />
          <div className="hidden sm:block">Home</div>
        </div>
      </NavLink>
      {(includeSearch || !isSmallerOrGreater) && (
        <NavRecipeSearch
          size={size}
          setShowPopover={setShowRecipeSearch}
          triggerRef={triggerRef}
        />
      )}
      <NavButtons size={size} />
    </nav>
  )
}
