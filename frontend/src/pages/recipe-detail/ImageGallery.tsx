import React, { useEffect } from "react"
import { ChevronLeft, ChevronRight, Star, X } from "react-feather"

import { Upload } from "@/api"
import { Button } from "@/components/Buttons"
import { styled } from "@/theme"
import { imgixFmt } from "@/utils/url"

const MyGalleryContainer = styled.div`
  opacity: 1 !important;
  z-index: 30;
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
`

// One problem with this is if images are too small, they'll get stretched by
// the height 100%.
//
// Without stetching, images in Chrome will appear small and the jump to their
// larger size when a larger srcset image is loaded.
const MyGalleryImg = styled.img.attrs({ loading: "eager" })`
  height: 100%;
  margin: auto;
  object-fit: contain;
`

const MyGalleryImgContainer = styled.div`
  min-height: 100%;
  min-width: 100%;
  display: flex;
  scroll-snap-align: start;
  position: relative;
`

const MySlideshowContainer = styled.div`
  display: flex;
  height: 100vh;
  width: 100vw;
  overflow-x: scroll;
  scroll-snap-type: x mandatory;
`

const MyGalleryScrollWrap = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
`

const MyGalleryBackground = styled.div`
  opacity: 0.8;
  background: #000;
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
`

const MyGalleryButton = styled(Button)`
  background: rgba(0, 0, 0, 0.46);
  color: white;
  border-style: none !important;
  box-shadow: none !important;
  backdrop-filter: blur(10px);
  pointer-events: initial;
`

const MyGalleryControlOverlay = styled.div`
  position: absolute;

  top: 0;
  height: 100%;
  width: 100%;
  display: grid;
  flex-direction: column;
  padding: 0.5rem;
  pointer-events: none;
`

const NavButtonRow = styled.div`
  display: flex;
  margin-top: auto;
  margin-bottom: auto;
  justify-content: space-between;

  width: 100%;
  grid-area: 1/1;
`

const TopRow = styled.div`
  display: flex;
  margin-bottom: auto;
  //justify-content: space-between;

  width: 100%;
  grid-area: 1/1;
`

function buildSrcSetUrls(u: string): string {
  const t = new URL(u)
  let srcSet = u
  for (const [width, quality] of [
    ["3000", "30"],
    ["2000", "40"],
  ]) {
    t.searchParams.set("w", width)
    t.searchParams.set("q", quality)
    srcSet = t.toString() + ` ${width}w, ` + srcSet
  }
  srcSet = imgixFmt(u) + ` 1200w, ` + srcSet
  return srcSet
}

export const Gallery = (props: {
  onClose: () => void
  focusedImageId: string
  images: Upload[]
  onNext: () => void
  onPrevious: () => void
  onStar: () => void
  hasNext: boolean
  enableStarButton: boolean
  hasPrevious: boolean
}) => {
  // navigate forward and back depending on horizontal click position.
  const onClick = (e: React.MouseEvent) => {
    const isRight = e.screenX / window.screen.width > 0.5
    const isLeft = !isRight
    if (props.hasNext && isRight) {
      props.onNext()
    }
    if (props.hasPrevious && isLeft) {
      props.onPrevious()
    }
  }

  useEffect(() => {
    document
      .getElementById(`gallery-image-${props.focusedImageId}`)
      ?.scrollIntoView()
  }, [props.focusedImageId])

  const starColor = false ? "#ffbf00" : undefined
  return (
    <MyGalleryContainer>
      <MyGalleryBackground />
      <MyGalleryScrollWrap>
        <MySlideshowContainer onClick={onClick}>
          {props.images.map((x, i) => {
            return (
              <MyGalleryImgContainer key={x.id}>
                <MyGalleryControlOverlay>
                  <TopRow>
                    {props.enableStarButton && (
                      <MyGalleryButton
                        className="mr-auto"
                        onClick={props.onStar}
                      >
                        <Star color={starColor} fill={starColor} />
                      </MyGalleryButton>
                    )}
                  </TopRow>
                </MyGalleryControlOverlay>
                <MyGalleryImg
                  id={`gallery-image-${x.id}`}
                  key={imgixFmt(x.url)}
                  src={imgixFmt(x.url)}
                  onLoad={(e) => {
                    // The common imigx format `src` will be in browser cache from the
                    // initial recipe page load. onLoad should then trigger loading a
                    // larger image by setting the `srcset`.
                    //
                    // We can't set the `srcset` initially, because Safari will show
                    // no image until it loads a larger image. By setting the `src`
                    // and waiting to set `srcset`, we'll see an image immediately in
                    // the gallery, served from cache.
                    e.currentTarget.srcset = buildSrcSetUrls(x.url)
                  }}
                  onClick={onClick}
                />
              </MyGalleryImgContainer>
            )
          })}
        </MySlideshowContainer>
        <MyGalleryControlOverlay>
          <TopRow>
            <MyGalleryButton className="ml-auto" onClick={props.onClose}>
              <X />
            </MyGalleryButton>
          </TopRow>
          <NavButtonRow>
            {props.hasPrevious && (
              <MyGalleryButton onClick={props.onPrevious} className="mr-auto">
                <ChevronLeft />
              </MyGalleryButton>
            )}
            {props.hasNext && (
              <MyGalleryButton onClick={props.onNext} className="ml-auto">
                <ChevronRight />
              </MyGalleryButton>
            )}
          </NavButtonRow>
        </MyGalleryControlOverlay>
      </MyGalleryScrollWrap>
    </MyGalleryContainer>
  )
}
