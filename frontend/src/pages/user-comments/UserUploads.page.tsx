import { useEffect, useRef, useState } from "react"
import { RouteComponentProps } from "react-router"
import { Link } from "react-router-dom"

import { Image } from "@/components/Image"
import { Loader } from "@/components/Loader"
import { NavPage } from "@/components/Page"
import { ProfilePageContainer } from "@/pages/profile/Profile.page"
import { ResponseFromUse } from "@/queries/useQueryUtilTypes"
import { useUserUploadsList } from "@/queries/useUserUploadsList"
import { recipeURL } from "@/urls"

// NOTE: need to keep in sync with the ProfilePageContainer
const MAX_WIDTH = 700
// NOTE: need to keep this in sync with the padding in the ProfilePageContainer
const PADDING_X = 12 * 2
function getPageWidth() {
  // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
  const viewportWidth = window.visualViewport!.width
  const gridWidth =
    // we remove the padding with -mx-3 on viewports less than small
    viewportWidth >= 640 ? viewportWidth - PADDING_X : viewportWidth
  return Math.min(gridWidth, MAX_WIDTH)
}

export function UserUploadsPage(
  props: RouteComponentProps<{ userId: string }>,
) {
  const uploads = useUserUploadsList({ id: props.match.params.userId })
  const ref = useRef<HTMLSpanElement>(null)

  const [innerPageWidth, setInnerPageWidth] = useState(getPageWidth)
  useEffect(() => {
    const handler = () => {
      setInnerPageWidth(getPageWidth())
    }
    window.addEventListener("resize", handler)
    return () => {
      window.removeEventListener("resize", handler)
    }
  }, [])

  if (uploads.isPending) {
    return (
      <NavPage title="Uploads">
        <Loader />
      </NavPage>
    )
  }

  if (uploads.isError) {
    return (
      <NavPage title="Uploads">
        <div>error loading photos</div>
      </NavPage>
    )
  }

  return (
    <ProfilePageContainer userId={props.match.params.userId} title="Uploads">
      <span className="text-2xl" ref={ref}>
        Photos
      </span>
      <ImageGrid
        uploads={uploads.data.uploads}
        innerPageWidth={innerPageWidth}
      />
    </ProfilePageContainer>
  )
}

// NOTE: keep this in sync with css gap
const GAP = 2
const MIN_IMAGE_SIZE = 100
function getImageSize(innerPageWidth: number) {
  // 7 = 700 / 100
  const initialRowCount = innerPageWidth / MIN_IMAGE_SIZE
  // 688 = 700 - (7 - 1) * 2
  const actualSpaceToWorkWith = innerPageWidth - (initialRowCount - 1) * GAP
  // 6 = 688 / 7
  const maxItemsPerRow = Math.floor(actualSpaceToWorkWith / MIN_IMAGE_SIZE)
  // 690 =
  const widthForImages = innerPageWidth - (maxItemsPerRow - 1) * GAP
  // 115 = 690 / 6
  return widthForImages / maxItemsPerRow
}

function ImageGrid({
  uploads,
  innerPageWidth,
}: {
  uploads: ResponseFromUse<typeof useUserUploadsList>["uploads"]
  innerPageWidth: number
}) {
  const imageSize = getImageSize(innerPageWidth)
  return (
    <div className="-mx-3 flex flex-wrap gap-[2px] sm:mx-0">
      {uploads.map((upload) => (
        <Link
          key={upload.id}
          className="h-[--image-size] w-[--image-size]"
          // eslint-disable-next-line no-restricted-syntax
          style={{
            // eslint-disable-next-line @typescript-eslint/consistent-type-assertions
            ["--image-size" as string]: `${imageSize}px`,
          }}
          to={
            recipeURL(upload.note.recipe.id, upload.note.recipe.name) +
            `#note-${upload.note.id}`
          }
        >
          <Image size="small" sources={upload} />
        </Link>
      ))}
    </div>
  )
}
