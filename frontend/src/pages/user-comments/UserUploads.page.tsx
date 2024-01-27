import { parseISO } from "date-fns"
import { RouteComponentProps } from "react-router"
import { Link } from "react-router-dom"

import { Avatar } from "@/components/Avatar"
import { Box } from "@/components/Box"
import { Helmet } from "@/components/Helmet"
import { Image } from "@/components/Image"
import { Loader } from "@/components/Loader"
import { NavPage } from "@/components/Page"
import { useUserById } from "@/queries/userById"
import { useUserUploadsList } from "@/queries/userUploadsList"
import { recipeURL } from "@/urls"

export function UserUploadsPage(
  props: RouteComponentProps<{ userId: string }>,
) {
  const userInfo = useUserById({ id: props.match.params.userId })
  const uploads = useUserUploadsList({ id: props.match.params.userId })

  if (userInfo.isPending) {
    return (
      <NavPage>
        <Loader />
      </NavPage>
    )
  }

  if (userInfo.isError) {
    return (
      <NavPage>
        <div>error loading comments</div>
      </NavPage>
    )
  }

  // e.g., in US locale: Nov 27, 2017
  const joinedDateStr = parseISO(userInfo.data.created).toLocaleDateString(
    undefined,
    { year: "numeric", month: "short", day: "numeric" },
  )

  return (
    <NavPage>
      <Box dir="col" className="mx-auto mt-8 max-w-[700px] gap-2">
        <Helmet title="Profile" />

        <Box dir="col" align="center">
          <Avatar avatarURL={userInfo.data.avatar_url} size={96} />
          <span className="text-2xl">{userInfo.data.name}</span>
          <span>Joined {joinedDateStr}</span>
        </Box>

        <div>
          <span className="text-2xl">Comments</span>
          <div className="flex flex-wrap  gap-2">
            {uploads.data?.uploads.map((upload) => (
              <Link
                key={upload.id}
                className="max-h-[100px] max-w-[100px]"
                to={recipeURL(upload.recipe.id, upload.recipe.name)}
              >
                <Image
                  imgixFmt="small"
                  sources={upload}
                  height={100}
                  width={100}
                />
              </Link>
            ))}
          </div>
        </div>
      </Box>
    </NavPage>
  )
}
