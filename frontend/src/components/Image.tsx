import { styled } from "@/theme"
import { imgixFmt } from "@/utils/url"

const CardImgContainer = styled.div<{
  height: number | undefined
  width: number | undefined
  rounded: boolean | undefined
}>`
  ${(p) => (p.width != null ? `min-width: ${p.width}px;` : `width: 100%;`)}

  ${(p) => (p.height != null ? `min-height: ${p.height}px;` : `height: 100%`)}

  ${(p) => p.rounded && `border-radius: 6px;`}

  background-color: var(--color-background-empty-image);
  position: relative;
`

const CardImg = styled.img<{
  rounded: boolean | undefined
  grayscale: boolean | undefined
}>`
  height: 100%;
  width: 100%;
  ${(p) => p.rounded && `border-radius: 6px;`}
  object-fit: cover;
  position: absolute;
  ${(p) => p.grayscale && `filter: grayscale(100%);`}
  z-index: 1;
`

const CardImgBg = styled.div<{
  backgroundImage: string
  blur: "none" | undefined
  rounded: boolean | undefined
  grayscale: boolean | undefined
}>`
  height: 100%;
  width: 100%;

  position: relative;
  ${(p) => p.backgroundImage && `background-image: url(${p.backgroundImage});`}

  background-position: center;
  background-size: cover;

  ${(p) => p.rounded && `border-radius: 6px;`}
  ${(p) => p.grayscale && `filter: grayscale(100%);`}

  ${(p) =>
    p.blur !== "none" &&
    `&:after {
      position: absolute;
      content: "";
      height: 100%;
      width: 100%;
      ${p.rounded && `border-radius: 6px;`}
      backdrop-filter: blur(6px);
      pointer-events: none;
    }`}
`

export function Image({
  sources,
  height,
  width,
  blur,
  rounded,
  grayscale,
  loading,
  onClick,
}: {
  readonly sources:
    | {
        readonly url: string
        readonly backgroundUrl: string | null
      }
    | null
    | undefined
  readonly height?: number
  readonly width?: number
  readonly blur?: "none"
  readonly grayscale?: boolean
  readonly loading?: "eager" | "lazy"
  readonly rounded?: boolean
  readonly onClick?: () => void
}) {
  return (
    <CardImgContainer
      height={height}
      width={width}
      rounded={rounded}
      onClick={onClick}
    >
      {sources != null && (
        <>
          <CardImg
            src={imgixFmt(sources.url ?? "")}
            rounded={rounded}
            grayscale={grayscale}
            loading={loading}
          />
          <CardImgBg
            backgroundImage={sources.backgroundUrl ?? ""}
            blur={blur}
            grayscale={grayscale}
            rounded={rounded}
          />
        </>
      )}
    </CardImgContainer>
  )
}
