import { RouteComponentProps } from "react-router"
import { Link } from "react-router-dom"

import { Loader } from "@/components/Loader"
import { NavPage } from "@/components/Page"
import { ProfilePageContainer } from "@/pages/profile/Profile.page"
import { Note } from "@/pages/recipe-detail/Notes"
import { useUserCommentsList } from "@/queries/useUserCommentsList"
import { recipeURL } from "@/urls"

export function UserCommentsPage(
  props: RouteComponentProps<{ userId: string }>,
) {
  const comments = useUserCommentsList({ id: props.match.params.userId })

  if (comments.isPending) {
    return (
      <NavPage title="Comments">
        <Loader />
      </NavPage>
    )
  }

  if (comments.isError) {
    return (
      <NavPage title="Comments">
        <div>error loading comments</div>
      </NavPage>
    )
  }

  return (
    <ProfilePageContainer userId={props.match.params.userId} title="Comments">
      <span className="text-2xl">Comments</span>
      <div className="flex flex-col gap-2">
        {comments.data?.comments.map((comment) => (
          <div key={comment.note.id} className="flex flex-col gap-1">
            <Link
              to={
                recipeURL(comment.recipe.id, comment.recipe.name) +
                `#note-${comment.note.id}`
              }
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
    </ProfilePageContainer>
  )
}
