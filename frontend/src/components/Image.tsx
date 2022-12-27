import { styled } from "@/theme"
import { imgixFmt } from "@/utils/url"

const CardImgContainer = styled.div<{ height: number; width: number }>`
  min-width: ${(p) => p.width}px;
  min-height: ${(p) => p.height}px;

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

const CardImgBg = styled.div<{ backgroundImage: string }>`
  height: 100%;
  width: 100%;

  position: relative;
  background-image: url(${(props) => props.backgroundImage});
  background-position: center;
  background-size: cover;

  &:after {
    position: absolute;
    content: "";
    height: 100%;
    width: 100%;
    border-radius: 6px;
    backdrop-filter: blur(6px);
    pointer-events: none;
  }
`

export function Image({
  sources,
  height,
  width,
}: {
  readonly sources: {
    readonly url: string
    readonly backgroundUrl: string | null
  } | null
  readonly height: number
  readonly width: number
}) {
  return (
    <CardImgContainer height={height} width={width}>
      {sources != null && (
        <>
          <CardImg src={imgixFmt(sources.url ?? "")} />
          <CardImgBg backgroundImage={sources.backgroundUrl ?? ""} />
        </>
      )}
    </CardImgContainer>
  )
}
