import { useEffect as useLayoutEffect, useRef, useState } from "react"
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
  const ref = useRef<HTMLSpanElement>(null)
  const maxWidth = 700
  const [innerPageWidth, setInnerPageWidth] = useState(maxWidth)
  useLayoutEffect(() => {
    const handler = () => {
      setInnerPageWidth(ref.current?.clientWidth ?? maxWidth)
    }
    window.addEventListener("resize", handler)
    return () => {
      window.removeEventListener("resize", handler)
    }
  }, [])

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
        <div>error loading photos</div>
      </NavPage>
    )
  }

  const GAP = 2
  const MIN_IMAGE_SIZE = 100
  // https://stackoverflow.com/a/64921523/3720597

  // 7 = 700 / 100
  const initialRowCount = innerPageWidth / MIN_IMAGE_SIZE
  // 688 = 700 - (7 - 1) * 2
  const actualSpaceToWorkWith = innerPageWidth - (initialRowCount - 1) * GAP
  // 6 = 688 / 7
  const maxItemsPerRow = Math.floor(actualSpaceToWorkWith / MIN_IMAGE_SIZE)
  // 690 =
  const widthForImages = innerPageWidth - (maxItemsPerRow - 1) * GAP
  // 115 = 690 / 6
  const imageSize = widthForImages / maxItemsPerRow

  const style = {
    // eslint-disable-next-line @typescript-eslint/consistent-type-assertions
    // "--image-size": `${imageSize}px`,
    "--GAP": "2",
    "--MIN_IMAGE_SIZE": "100",
    "--MAX_SECTION_SIZE": "700px",
    "--innerPageWidth": "min(var(--MAX_SECTION_SIZE), 100vw)",
    "--initialRowCount": "calc(var(--innerPageWidth) / var(--MIN_IMAGE_SIZE))",
    "--actualSpaceToWorkWith":
      "calc(var(--innerPageWidth) - (var(--initialRowCount) - 1px) * var(--GAP))",
    "--maxItemsPerRowRaw":
      "calc(var(--actualSpaceToWorkWith) / var(--MIN_IMAGE_SIZE))",
    // NOTE: this doesn't work because we can't round (minor issue) and more
    // importantly we can't divide the pixel value of `--widthForImages` by
    // the resulting value of `--maxItemsPerRowRaw` which is a pixel value, it
    // turns to zero.
    "--widthForImages":
      "calc(var(--innerPageWidth) - (var(--maxItemsPerRowRaw) - 1px) * var(--GAP))",
    "--image-size": "calc(var(--widthForImages) / var(--maxItemsPerRowRaw))",
  }

  return (
    <ProfilePageContainer userId={props.match.params.userId}>
      <span className="text-2xl" ref={ref}>
        Photos
      </span>
      <div className="flex flex-wrap gap-[2px]">
        {uploads.data?.uploads.map((upload, i) => (
          <Link
            id={i === 0 ? "first-upload" : undefined}
            key={upload.id}
            className="h-[--image-size] w-[--image-size]"
            // eslint-disable-next-line no-restricted-syntax
            style={style}
            to={
              recipeURL(upload.note.recipe.id, upload.note.recipe.name) +
              `#note-${upload.note.id}`
            }
          >
            <Image imgixFmt="small" sources={upload} />
          </Link>
        ))}
      </div>
    </ProfilePageContainer>
  )
}
