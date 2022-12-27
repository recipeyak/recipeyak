import { css, styled } from "@/theme"
import { imgixFmt } from "@/utils/url"

const CardImgContainer = styled.div<{
  height: number | undefined
  width: number | undefined
}>`
  ${(p) => (p.width != null ? `min-width: ${p.width}px;` : `width: 100%;`)}

  ${(p) => (p.height != null ? `min-height: ${p.height}px;` : `height: 100%`)}

  border-radius: 6px;

  background-color: rgb(237, 237, 237);
  position: relative;
`

const CardImg = styled.img`
  height: 100%;
  width: 100%;
  border-radius: 6px;
  object-fit: cover;
  position: absolute;
  z-index: 1;
`

const CardImgBg = styled.div<{
  backgroundImage: string
  blur: "none" | undefined
}>`
  height: 100%;
  width: 100%;

  position: relative;
  background-image: url(${(props) => props.backgroundImage});
  background-position: center;
  background-size: cover;

  border-radius: 6px;

  ${(p) =>
    p.blur !== "none" &&
    `&:after {
      position: absolute;
      content: "";
      height: 100%;
      width: 100%;
      border-radius: 6px;
      backdrop-filter: blur(6px);
      pointer-events: none;
    }`}
`

export function Image({
  sources,
  height,
  width,
  blur,
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
}) {
  return (
    <CardImgContainer height={height} width={width}>
      {sources != null && (
        <>
          <CardImg src={imgixFmt(sources.url ?? "")} />
          <CardImgBg
            backgroundImage={sources.backgroundUrl ?? ""}
            blur={blur}
          />
        </>
      )}
    </CardImgContainer>
  )
}
