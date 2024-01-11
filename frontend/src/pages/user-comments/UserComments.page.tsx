import { parseISO } from "date-fns"
import { RouteComponentProps } from "react-router"

import { Avatar } from "@/components/Avatar"
import { Box } from "@/components/Box"
import { Helmet } from "@/components/Helmet"
import { Loader } from "@/components/Loader"
import { NavPage } from "@/components/Page"
import { Link } from "@/components/Routing"
import { Note } from "@/pages/recipe-detail/Notes"
import { pathRecipeDetail } from "@/paths"
import { useUserById } from "@/queries/userById"
import { useUserCommentsList } from "@/queries/userCommentsList"

export function UserCommentsPage(
  props: RouteComponentProps<{ userId: string }>,
) {
  const userInfo = useUserById({ id: props.match.params.userId })
  const comments = useUserCommentsList({ id: props.match.params.userId })

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
          <div className="flex flex-col gap-2">
            {comments.data?.comments.slice(0, 100).map((comment) => (
              <div key={comment.note.id} className="flex flex-col gap-1">
                <Link
                  to={pathRecipeDetail({
                    recipeId: comment.recipe.id.toString(),
                  })}
                >
                  <div className="text-lg">{comment.recipe.name}</div>
                </Link>
                <Note
                  note={comment.note}
                  readonly
                  recipeId={comment.recipe.id}
                  openImage={() => {}}
                />
              </div>
            ))}
          </div>
        </div>
      </Box>
    </NavPage>
  )
}
