import { useQueryClient } from "@tanstack/react-query"
import React from "react"
import { Link, useHistory } from "react-router-dom"
import useOnClickOutside from "use-onclickoutside"

import { useIsLoggedIn } from "@/auth"
import { clx } from "@/classnames"
import { Avatar } from "@/components/Avatar"
import { Button } from "@/components/Buttons"
import { DropdownContainer, DropdownMenu } from "@/components/Dropdown"
import { SearchInput, Select } from "@/components/Forms"
import Logo from "@/components/Logo"
import { NavLink } from "@/components/Routing"
import { SearchResult } from "@/components/SearchResult"
import { useDropdown } from "@/components/useDropdown"
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
import { useRecipeList } from "@/queries/recipeList"
import { useTeamList } from "@/queries/teamList"
import { searchRecipes } from "@/search"
import { useGlobalEvent } from "@/useGlobalEvent"
import { useTeamId } from "@/useTeamId"
import { useUser } from "@/useUser"

interface IUserAvatarProps {
  readonly onClick: () => void
  readonly url: string
}
function UserAvatar({ onClick, url }: IUserAvatarProps) {
  return <Avatar onClick={onClick} tabIndex={0} avatarURL={url} />
}

function LogoutButton() {
  const logoutUser = useAuthLogout()
  return (
    <Button
      size="small"
      onClick={() => {
        logoutUser.mutate()
      }}
      loading={logoutUser.isPending}
      className="w-full"
    >
      Logout
    </Button>
  )
}

function UserEmail({ email }: { email: string }) {
  return <p className="font-bold">{email}</p>
}

function TeamSelect() {
  const queryClient = useQueryClient()
  const history = useHistory()
  const value = useTeamId()

  const onChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const teamID = parseInt(e.target.value, 10)
    // TODO: instead of navigating to the schedule page we should update the
    // path param of the current route if there is a teamID in it.
    // Maybe we can get rid of the teamID from the URL entirely?
    const url = pathSchedule({ teamId: teamID.toString() })
    // navTo is async so we can't count on the URL to have changed by the time we refetch the data
    history.push(url)
    // TODO: we should abstract this -- it's hacky
    void queryClient.invalidateQueries({
      queryKey: [teamID],
    })
    void queryClient.invalidateQueries({
      queryKey: ["user-detail"],
    })
  }
  const teams = useTeamList()
  return (
    <Select onChange={onChange} value={value} disabled={teams.isPending}>
      {teams.isSuccess
        ? teams.data.map((t) => (
            <option key={t.id} value={t.id}>
              {t.name}
            </option>
          ))
        : null}
    </Select>
  )
}

function UserDropdown() {
  const { ref, toggle, isOpen } = useDropdown()
  const user = useUser()

  const links: Array<[string, string]> = [
    [pathProfileById({ userId: String(user.id) }), "Profile"],
    [pathSettings({}), "Settings"],
    [pathTeamList({}), "Teams"],
  ]

  return (
    <DropdownContainer ref={ref}>
      <UserAvatar onClick={toggle} url={user.avatarURL} />
      <DropdownMenu isOpen={isOpen} position="right">
        <UserEmail email={user.email} />
        <TeamSelect />
        {links.map(([to, text]) => (
          <Link key={text} className="w-full" to={to} onClick={toggle}>
            {text}
          </Link>
        ))}
        <LogoutButton />
      </DropdownMenu>
    </DropdownContainer>
  )
}

function WordMark() {
  return <span className="hidden text-2xl sm:block">Recipe Yak</span>
}

function AuthButtons() {
  return (
    <div className="flex justify-self-end">
      <NavLink className={stylesNavItem} to={pathLogin({})}>
        Login
      </NavLink>
      <NavLink className={stylesNavItem} to={pathSignup({})}>
        Signup
      </NavLink>
    </div>
  )
}

function NavButtons() {
  const teamId = useTeamId()
  return (
    <div className="relative flex items-center justify-center  justify-self-end">
      <DropdownContainer>
        <div className="flex">
          <NavLink
            to={pathRecipeAdd({})}
            className={stylesNavItem}
            activeClassName="!underline"
          >
            Add
          </NavLink>
          <NavLink
            to={pathRecipesList({})}
            className={stylesNavItem}
            activeClassName="!underline"
          >
            Browse
          </NavLink>
          <NavLink
            to={pathSchedule({ teamId: teamId.toString() })}
            className={stylesNavItem}
            activeClassName="!underline"
          >
            Calendar
          </NavLink>
        </div>
      </DropdownContainer>

      <UserDropdown />
    </div>
  )
}

const stylesNavItem =
  "flex shrink-0 grow-0 cursor-pointer items-center justify-center px-3 py-2 text-[14px] font-medium leading-[1.5] text-[var(--color-text)] transition-all hover:text-[var(--color-link-hover)] hover:underline active:translate-y-[1px]"

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
  const recipes = useRecipeList()
  const [searchQuery, setSearchQuery] = React.useState("")
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
    setSearchQuery("")
    setIsClosed(false)
  }

  const filteredRecipes = recipes.isSuccess
    ? searchRecipes({ recipes: recipes.data, query: searchQuery })
    : { recipes: [] }

  const handleSearchKeydown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    // We need to extract the key from the synthetic event before we lose the
    // event.
    const key = e.key
    const suggestion = filteredRecipes.recipes[0]
    if (!suggestion) {
      return
    }
    if (key === "Enter") {
      resetForm()
      history.push(
        pathRecipeDetail({ recipeId: suggestion.recipe.id.toString() }),
      )
    }
  }

  return (
    <div ref={ref} className="flex w-full">
      <SearchInput
        ref={searchInputRef}
        value={searchQuery}
        placeholder="Press / to search"
        onChange={(e) => {
          setSearchQuery(e.target.value)
        }}
        onKeyDown={handleSearchKeydown}
        onFocus={() => {
          setIsClosed(false)
        }}
      />
      {searchQuery && !isClosed && (
        <div className="absolute inset-x-0 top-[60px] z-10 w-full sm:inset-x-[unset] sm:max-w-[400px]">
          <SearchResult
            isLoading={recipes.isLoading}
            searchQuery={searchQuery}
            searchResults={filteredRecipes.recipes}
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
  return (
    <nav className="mb-1 flex h-[3rem] shrink-0 justify-between px-3 print:!hidden md:grid md:grid-cols-3">
      <Link
        to={pathHome({})}
        className={clx(stylesNavItem, "!justify-start !px-0 py-1 font-normal")}
      >
        <Logo width="40px" />
        {isLoggedIn ? (
          <span className="ml-2 hidden font-medium sm:block">Home</span>
        ) : (
          <WordMark />
        )}
      </Link>
      <div className="ml-3 flex grow items-center">
        {includeSearch && <Search />}
      </div>
      {isLoggedIn ? <NavButtons /> : <AuthButtons />}
    </nav>
  )
}
