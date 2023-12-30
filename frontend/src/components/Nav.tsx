import React from "react"
import {
  Button,
  Menu,
  MenuItem,
  MenuItemProps,
  MenuTrigger,
  Popover,
  Separator,
} from "react-aria-components"
import {
  Configure,
  InstantSearch,
  useHits,
  useSearchBox,
} from "react-instantsearch"
import { Link, useHistory } from "react-router-dom"
import useOnClickOutside from "use-onclickoutside"

import { useIsLoggedIn } from "@/auth"
import { clx } from "@/classnames"
import { Avatar } from "@/components/Avatar"
import { SearchInput } from "@/components/Forms"
import Logo from "@/components/Logo"
import { NavLink } from "@/components/Routing"
import { SearchResult } from "@/components/SearchResult"
import {
  pathHome,
  pathLogin,
  pathProfileById,
  pathRecipeAdd,
  pathRecipeDetail,
  pathRecipesList,
  pathSchedule,
  pathSettings,
  pathSignup,
  pathTeamList,
} from "@/paths"
import { useAuthLogout } from "@/queries/authLogout"
import { useTeam } from "@/queries/teamFetch"
import { useSearchClient } from "@/queries/useSearchClient"
import { useGlobalEvent } from "@/useGlobalEvent"
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
      <Button className="flex cursor-pointer items-center justify-center rounded-full border-none bg-[unset] p-0 focus-visible:outline focus-visible:outline-[3px] focus-visible:-outline-offset-2 focus-visible:outline-[rgb(47,129,247)]">
        <Avatar avatarURL={user.avatarURL} />
      </Button>
      <Popover className="w-56 origin-top-left overflow-auto rounded-md border border-solid border-[var(--color-border)] bg-[var(--color-background-calendar-day)] p-2 shadow-lg outline-none">
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
          <MenuItem id="meta-info" className="pl-2">
            <div className="pb-1 ">
              <span className="">{user.name ?? user.email}</span>
              <span> · </span>
              <span className="text-sm ">{team.data?.name}</span>
              <div className="text-sm ">{user.email}</div>
            </div>
          </MenuItem>
          <Separator className="my-1 h-[1px] bg-[var(--color-border)]" />
          {menuItems.map((menuItem) => {
            if (menuItem.type === "separator") {
              return (
                <Separator
                  id={menuItem.id}
                  key={menuItem.id}
                  className="my-1 h-[1px] bg-[var(--color-border)]"
                />
              )
            }
            return (
              <ActionItem
                id={menuItem.label}
                key={menuItem.label}
                href={menuItem.to}
              >
                {menuItem.label}
              </ActionItem>
            )
          })}
        </Menu>
      </Popover>
    </MenuTrigger>
  )
}

function ActionItem(props: Omit<MenuItemProps, "className">) {
  return (
    <MenuItem
      {...props}
      className={
        "flex cursor-pointer rounded px-2 py-1 [transition:background_.12s_ease-out] hover:bg-[var(--color-border)] focus-visible:outline-[3px] focus-visible:-outline-offset-2 focus-visible:outline-[rgb(47,129,247)] "
      }
    />
  )
}

function WordMark() {
  return <span className="hidden text-2xl sm:block">Recipe Yak</span>
}

function AuthButtons() {
  return (
    <div className="flex justify-self-end">
      <NavLink className={navItemCss} to={pathLogin({})}>
        Login
      </NavLink>
      <NavLink className={navItemCss} to={pathSignup({})}>
        Signup
      </NavLink>
    </div>
  )
}

function NavButtons() {
  return (
    <div className="relative flex items-center justify-center gap-2 justify-self-end">
      <div className="flex print:!hidden sm:gap-2">
        <NavLink
          to={pathRecipeAdd({})}
          className={navItemCss}
          activeClassName={activeNavItemCss}
        >
          Add
        </NavLink>
        <NavLink
          to={pathRecipesList({})}
          className={navItemCss}
          activeClassName={activeNavItemCss}
        >
          Browse
        </NavLink>
        <NavLink
          to={pathSchedule({})}
          className={navItemCss}
          activeClassName={activeNavItemCss}
        >
          Calendar
        </NavLink>
      </div>

      <UserDropdown />
    </div>
  )
}

const navItemCss =
  "flex shrink-0 grow-0 cursor-pointer items-center justify-center rounded-md px-2 py-1 text-[14px] font-medium leading-[1.5] text-[var(--color-text)] transition-all [transition:background_.12s_ease-out] hover:bg-[var(--color-background-calendar-day)] hover:text-[var(--color-link-hover)] active:bg-[var(--color-border)]"
const activeNavItemCss = "bg-[var(--color-background-calendar-day)]"

function isInputFocused() {
  const activeElement = document.activeElement
  return (
    activeElement !== document.body &&
    activeElement !== null &&
    (activeElement.tagName === "INPUT" || activeElement.tagName === "TEXTAREA")
  )
}

/**
 *
 * Implementation is very similar to "Search" in UserHome.tsx.
 */
function Search() {
  const history = useHistory()
  const { query, refine } = useSearchBox()
  const { hits } = useHits<{
    readonly id: number
    readonly name: string
    readonly archived_at: string | null
    readonly author: string | null
  }>()

  // If a user clicks outside of the dropdown, we want to hide the dropdown, but
  // keep their search query.
  //
  // The alternative would be to clear the search query when clicking outside,
  // but I'm not sure that's desirable.
  const [isClosed, setIsClosed] = React.useState(false)
  const searchInputRef = React.useRef<HTMLInputElement>(null)

  const ref = React.useRef(null)
  useOnClickOutside(ref, () => {
    setIsClosed(true)
  })

  useGlobalEvent({
    keyDown(e) {
      if (
        (e.key === "k" && e.metaKey) ||
        (e.key === "/" && !isInputFocused())
      ) {
        searchInputRef.current?.focus()
        e.preventDefault()
      }
    },
  })

  const resetForm = () => {
    refine("")
    setIsClosed(false)
  }

  const handleSearchKeydown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    // We need to extract the key from the synthetic event before we lose the
    // event.
    const key = e.key
    const suggestion = hits[0]
    if (!suggestion) {
      return
    }
    if (key === "Enter") {
      resetForm()
      history.push(pathRecipeDetail({ recipeId: suggestion.id.toString() }))
    }
  }

  return (
    <div ref={ref} className="flex w-full">
      <SearchInput
        ref={searchInputRef}
        value={query}
        placeholder="Press / to search"
        onChange={(e) => {
          refine(e.target.value)
        }}
        onKeyDown={handleSearchKeydown}
        onFocus={() => {
          setIsClosed(false)
        }}
      />
      {query && !isClosed && (
        <div className="absolute inset-x-0 top-[60px] z-10 w-full sm:inset-x-[unset] sm:max-w-[400px]">
          <SearchResult
            hits={hits}
            onClick={() => {
              resetForm()
            }}
          />
        </div>
      )}
    </div>
  )
}

export function Navbar({ includeSearch = true }: { includeSearch?: boolean }) {
  const isLoggedIn = useIsLoggedIn()
  const teamId = useTeamId()
  const searchClient = useSearchClient()
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
        <Link to={pathHome({})} className={clx(navItemCss, "hidden sm:block")}>
          {isLoggedIn ? (
            <span className="font-medium ">Home</span>
          ) : (
            <WordMark />
          )}
        </Link>
      </div>
      <div className="flex grow items-center">
        {includeSearch && searchClient && (
          <InstantSearch
            searchClient={searchClient}
            indexName="recipes"
            // use custom routing config so we can have `search` be our query parameter.
            // https://www.algolia.com/doc/guides/building-search-ui/going-further/routing-urls/react-hooks/
            routing={{
              stateMapping: {
                stateToRoute(uiState) {
                  const indexUiState = uiState["recipes"]
                  return { search: indexUiState.query }
                },
                routeToState(routeState) {
                  return {
                    ["recipes"]: {
                      query: routeState.search,
                    },
                  }
                },
              },
            }}
          >
            <Search />
            <Configure hitsPerPage={1000} filters={`team_id:${teamId}`} />
          </InstantSearch>
        )}
      </div>
      {isLoggedIn ? <NavButtons /> : <AuthButtons />}
    </nav>
  )
}
