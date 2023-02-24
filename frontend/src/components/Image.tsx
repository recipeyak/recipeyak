import { useRef } from "react"

import { styled } from "@/theme"
import { useIntersectionObserver } from "@/useIntersectionObserver"
import { imgixFmt } from "@/utils/url"

const CardImgContainer = styled.div<{
  height: number | undefined
  width: number | undefined
  roundDesktop: boolean | undefined
  rounded: boolean | undefined
}>`
  ${(p) => (p.width != null ? `min-width: ${p.width}px;` : `width: 100%;`)}

  ${(p) => (p.height != null ? `min-height: ${p.height}px;` : `height: 100%`)}

  ${(p) => p.rounded && `border-radius: 6px;`}
  ${(p) =>
    p.roundDesktop &&
    `@media (min-width: 600px) {
      border-radius: 6px;
    }`}

  background-color: var(--color-background-empty-image);
  position: relative;
`

const CardImg = styled.img<{
  roundDesktop: boolean | undefined
  rounded: boolean | undefined
  grayscale: boolean | undefined
}>`
  height: 100%;
  width: 100%;
  ${(p) => p.rounded && `border-radius: 6px;`}
  ${(p) =>
    p.roundDesktop &&
    `@media (min-width: 600px) {
      border-radius: 6px;
    }`}
  object-fit: cover;
  position: absolute;
  ${(p) => p.grayscale && `filter: grayscale(100%);`}
  z-index: 1;
`

const CardImgBg = styled.div<{
  backgroundImage: string
  blur: "none" | undefined
  roundDesktop: boolean | undefined
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
  ${(p) =>
    p.roundDesktop &&
    `@media (min-width: 600px) {
      border-radius: 6px;
    }`}
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
  roundDesktop,
  grayscale,
  loading,
  onClick,
  loadWhenInView,
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
  readonly roundDesktop?: boolean
  readonly onClick?: () => void
  readonly loadWhenInView?: boolean
}) {
  const ref = useRef<HTMLDivElement | null>(null)
  const entry = useIntersectionObserver(ref, {
    // How much to expand element's margin before calculating intersections
    // Means we load images before they're in view so there isn't a pop in.
    //
    // NOTE: Might need to tweak this, maybe consider scroll velocity?
    rootMargin: "500px",
  })
  const isVisible = !loadWhenInView || entry?.isIntersecting
  return (
    <CardImgContainer
      ref={ref}
      roundDesktop={roundDesktop}
      height={height}
      width={width}
      rounded={rounded}
      onClick={onClick}
    >
      {sources != null && isVisible && (
        <>
          <CardImg
            src={imgixFmt(sources.url ?? "")}
            roundDesktop={roundDesktop}
            rounded={rounded}
            grayscale={grayscale}
            loading={loading}
          />
          <CardImgBg
            backgroundImage={sources.backgroundUrl ?? ""}
            blur={blur}
            grayscale={grayscale}
            roundDesktop={roundDesktop}
            rounded={rounded}
          />
        </>
      )}
    </CardImgContainer>
  )
}
