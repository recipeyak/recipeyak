import { RouteComponentProps } from "react-router"
import { Link } from "react-router-dom"

import { Image } from "@/components/Image"
import { Loader } from "@/components/Loader"
import { NavPage } from "@/components/Page"
import { ProfilePageContainer } from "@/pages/profile/Profile.page"
import { useUserUploadsList } from "@/queries/userUploadsList"
import { recipeURL } from "@/urls"

export function UserUploadsPage(
  props: RouteComponentProps<{ userId: string }>,
) {
  const uploads = useUserUploadsList({ id: props.match.params.userId })

  if (uploads.isPending) {
    return (
      <NavPage>
        <Loader />
      </NavPage>
    )
  }

  if (uploads.isError) {
    return (
      <NavPage>
        <div>error loading comments</div>
      </NavPage>
    )
  }

  return (
    <ProfilePageContainer userId={props.match.params.userId}>
      <span className="text-2xl">Comments</span>
      <div className="flex flex-wrap  gap-2">
        {uploads.data?.uploads.map((upload) => (
          <Link
            key={upload.id}
            className="max-h-[100px] max-w-[100px]"
            to={
              recipeURL(upload.note.recipe.id, upload.note.recipe.name) +
              `#note-${upload.note.id}`
            }
          >
            <Image imgixFmt="small" sources={upload} height={100} width={100} />
          </Link>
        ))}
      </div>
    </ProfilePageContainer>
  )
}
