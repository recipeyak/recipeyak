import { parseISO } from "date-fns"
import { RouteComponentProps } from "react-router"

import { Box } from "@/components/Box"
import { Helmet } from "@/components/Helmet"
import { Loader } from "@/components/Loader"
import { useUserById } from "@/queries/userById"

interface IProfileImgProps {
  readonly avatarURL: string
}
function ProfileImg({ avatarURL }: IProfileImgProps) {
  const size = 96
  return (
    <a href="https://secure.gravatar.com" className="justify-self-center ">
      <img
        width={size}
        height={size}
        alt="user profile"
        className="br-5"
        src={avatarURL + `&s=${size}`}
      />
    </a>
  )
}

// icons from: https://lucide.dev

const AppIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="18"
    height="18"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    stroke-width="2"
    stroke-linecap="round"
    stroke-linejoin="round"
  >
    <circle cx="12" cy="12" r="10" />
    <line x1="14.31" x2="20.05" y1="8" y2="17.94" />
    <line x1="9.69" x2="21.17" y1="8" y2="8" />
    <line x1="7.38" x2="13.12" y1="12" y2="2.06" />
    <line x1="9.69" x2="3.95" y1="16" y2="6.06" />
    <line x1="14.31" x2="2.83" y1="16" y2="16" />
    <line x1="16.62" x2="10.88" y1="12" y2="21.94" />
  </svg>
)

const PlantIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="18"
    height="18"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    stroke-width="2"
    stroke-linecap="round"
    stroke-linejoin="round"
  >
    <path d="M7 20h10" />
    <path d="M10 20c5.5-2.5.8-6.4 3-10" />
    <path d="M9.5 9.4c1.1.8 1.8 2.2 2.3 3.7-2 .4-3.5.4-4.8-.3-1.2-.6-2.3-1.9-3-4.2 2.8-.5 4.4 0 5.5.8z" />
    <path d="M14.1 6a7 7 0 0 0-1.1 4c1.9-.1 3.3-.6 4.3-1.4 1-1 1.6-2.3 1.7-4.6-2.7.1-4 1-4.9 2z" />
  </svg>
)

const TrashIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="18"
    height="18"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    stroke-width="2"
    stroke-linecap="round"
    stroke-linejoin="round"
  >
    <path d="M3 6h18" />
    <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6" />
    <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" />
  </svg>
)

const MessageIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="18"
    height="18"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    stroke-width="2"
    stroke-linecap="round"
    stroke-linejoin="round"
  >
    <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
  </svg>
)

const TrophyIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="18"
    height="18"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    stroke-width="2"
    stroke-linecap="round"
    stroke-linejoin="round"
  >
    <path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6" />
    <path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18" />
    <path d="M4 22h16" />
    <path d="M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20.24 7 22" />
    <path d="M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20.24 17 22" />
    <path d="M18 2H6v7a6 6 0 0 0 12 0V2Z" />
  </svg>
)

function Profile(props: RouteComponentProps<{ userId: string }>) {
  const userInfo = useUserById({ id: props.match.params.userId })

  if (userInfo.isLoading) {
    return <Loader />
  }

  if (userInfo.isError) {
    return <div>error loading profile, 404 maybe?</div>
  }

  const allStats = [
    [userInfo.data.stats.recipesAdd, "Recipes Added", PlantIcon],
    [userInfo.data.stats.recipesArchived, "Recipes Archived", TrashIcon],
    [userInfo.data.stats.comments, "Comments", MessageIcon],
    [userInfo.data.stats.photos, "Photos", AppIcon],
    [userInfo.data.stats.primaryPhotos, "Primary Photos", TrophyIcon],
  ] as const

  // e.g., in US locale: Nov 27, 2017
  const joinedDateStr = parseISO(userInfo.data.created).toLocaleDateString(
    undefined,
    { year: "numeric", month: "short", day: "numeric" },
  )

  return (
    <Box
      style={{
        maxWidth: 700,
        marginLeft: "auto",
        marginRight: "auto",
      }}
      dir="col"
    >
      <Helmet title="Profile" />

      <Box dir="col" align="center">
        <ProfileImg avatarURL={userInfo.data.avatar_url} />
        <span className="fs-6">{userInfo.data.name}</span>
        <span>Joined {joinedDateStr}</span>
      </Box>

      <span className="fs-6">Stats</span>

      <Box dir="row" align="start" wrap gap={4} style={{ fontSize: 18 }}>
        {allStats.map(([value, name, Icon]) => {
          return (
            <Box
              key={name}
              gap={1}
              align="center"
              style={{
                padding: "0.5rem",
                paddingTop: "0.25rem",
                paddingBottom: "0.25rem",
                border: "1px solid lightgray",
                borderRadius: 6,
              }}
            >
              <Icon /> {name} · {value}
            </Box>
          )
        })}
      </Box>
    </Box>
  )
}

export default Profile
