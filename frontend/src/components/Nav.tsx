import { useQueryClient } from "@tanstack/react-query"
import React from "react"
import { Link, useHistory } from "react-router-dom"
import useOnClickOutside from "use-onclickoutside"

import { useIsLoggedIn } from "@/auth"
import { Avatar } from "@/components/Avatar"
import { Button } from "@/components/Buttons"
import {
  DropdownContainer,
  DropdownMenu,
  useDropdown,
} from "@/components/Dropdown"
import { SearchInput, Select } from "@/components/Forms"
import Logo from "@/components/Logo"
import { NavLink } from "@/components/Routing"
import { useGlobalEvent, useTeamId, useUser } from "@/hooks"
import { SearchResult } from "@/pages/index/UserHome"
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
import { styled } from "@/theme"

interface IUserAvatarProps {
  readonly onClick: () => void
  readonly url: string
}
function UserAvatar({ onClick, url }: IUserAvatarProps) {
  return (
    <BetterNavItem
      as={Avatar}
      onClick={onClick}
      tabIndex={0}
      className="!p-0"
      avatarURL={url}
    />
  )
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

const WordMarkContainer = styled.span`
  font-size: 1.5rem;
  @media (max-width: ${(p) => p.theme.small}) {
    display: none;
  }
`

function WordMark() {
  return <WordMarkContainer>Recipe Yak</WordMarkContainer>
}

function AuthButtons() {
  return (
    <div className="flex justify-self-end">
      <BetterNavItem as={NavLink} to={pathLogin({})}>
        Login
      </BetterNavItem>
      <BetterNavItem as={NavLink} to={pathSignup({})}>
        Signup
      </BetterNavItem>
    </div>
  )
}

function NavButtons() {
  const teamId = useTeamId()
  return (
    <div className="relative flex items-center justify-center  justify-self-end">
      <DropdownContainer>
        <div className="flex">
          <BetterNavItem
            as={NavLink}
            to={pathRecipeAdd({})}
            activeClassName="active"
          >
            Add
          </BetterNavItem>
          <BetterNavItem
            as={NavLink}
            to={pathRecipesList({})}
            activeClassName="active"
          >
            Browse
          </BetterNavItem>
          <BetterNavItem
            as={NavLink}
            to={pathSchedule({ teamId: teamId.toString() })}
            activeClassName="active"
          >
            Calendar
          </BetterNavItem>
        </div>
      </DropdownContainer>

      <UserDropdown />
    </div>
  )
}

const NavContainer = styled.nav`
  flex-wrap: 1;
  margin-bottom: 0.25rem;
  padding-left: 0.75rem;
  padding-right: 0.75rem;
  justify-content: space-between;
  flex-shrink: 0;
  height: 3rem;

  @media (min-width: 920px) {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
  }

  @media (max-width: 919px) {
    display: flex;
  }
`

const BetterNavItem = styled.div`
  align-items: center;
  display: flex;
  flex-grow: 0;
  flex-shrink: 0;
  font-size: 14px;
  justify-content: center;
  line-height: 1.5;
  padding: 0.5rem 0.75rem;
  font-weight: 500;
  color: var(--color-text);
  cursor: pointer;
  text-decoration: none;
  transition: all 0.1s;

  @media (hover: hover) {
    &:hover {
      color: var(--color-link-hover);
      text-decoration: underline;
    }
  }

  &:active {
    transform: translateY(1px);
  }

  &.active {
    text-decoration: underline;
  }
`

const SearchInputContainer = styled.div`
  display: flex;
  width: 100%;
`

const SearchResultContainer = styled.div`
  position: absolute;
  z-index: 10;
  top: 60px;
  max-width: 400px;
  width: 100%;

  @media (max-width: 475px) {
    left: 0;
    right: 0;
    max-width: initial;
  }
`

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
      if (e.key === "k" && e.metaKey) {
        searchInputRef.current?.focus()
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
    <SearchInputContainer ref={ref}>
      <SearchInput
        ref={searchInputRef}
        value={searchQuery}
        placeholder="search your recipes..."
        onChange={(e) => {
          setSearchQuery(e.target.value)
        }}
        onKeyDown={handleSearchKeydown}
        onFocus={() => {
          setIsClosed(false)
        }}
      />
      {searchQuery && !isClosed && (
        <SearchResultContainer>
          <SearchResult
            isLoading={recipes.isLoading}
            searchQuery={searchQuery}
            searchResults={filteredRecipes.recipes}
            onClick={() => {
              resetForm()
            }}
          />
        </SearchResultContainer>
      )}
    </SearchInputContainer>
  )
}

export function Navbar({ includeSearch = true }: { includeSearch?: boolean }) {
  const isLoggedIn = useIsLoggedIn()
  return (
    <NavContainer className="print:!hidden">
      <BetterNavItem
        as={Link}
        to={pathHome({})}
        className="!justify-start px-0 py-1 font-normal"
      >
        <Logo width="40px" />
        {isLoggedIn ? (
          <span className="ml-2 hidden font-medium sm:block">Home</span>
        ) : (
          <WordMark />
        )}
      </BetterNavItem>
      <div className="ml-3 flex grow items-center">
        {includeSearch && <Search />}
      </div>
      {isLoggedIn ? <NavButtons /> : <AuthButtons />}
    </NavContainer>
  )
}
