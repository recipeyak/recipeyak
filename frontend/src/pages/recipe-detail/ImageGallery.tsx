import React from "react"
import { ChevronLeft, ChevronRight, Share, Star, X } from "react-feather"

import { Button } from "@/components/Buttons"
import { buildGallerySrcSetUrls, formatImg } from "@/url"

function GalleryButton({
  children,
  className,
  onClick,
}: {
  children: React.ReactNode
  className?: string
  onClick?: () => void
}) {
  return (
    <Button onClick={onClick} variant="gradient" className={className}>
      {children}
    </Button>
  )
}

export const Gallery = (props: {
  onClose: () => void
  imageUrl: string
  contentType: string
  readonly isPrimary: boolean
  onNext: () => void
  onPrevious: () => void
  onStar: () => void
  hasNext: boolean
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

  const starColor = props.isPrimary ? "#ffbf00" : undefined
  return (
    <div className="fixed left-0 top-0 z-30 h-full w-full !opacity-100">
      <div className="left-0 top-0 h-full w-full bg-[#000] opacity-[0.8]" />
      <div className="absolute left-0 top-0 h-full w-full">
        <div
          className="flex h-full"
          onClick={onClick}
          aria-label="view other image"
        >
          {props.contentType.startsWith("application/pdf") ? (
            // tried using <embed /> but it would fail to load the pdf after the
            // dom node was unmounted and remounted
            <iframe
              src={props.imageUrl}
              // eslint-disable-next-line no-restricted-syntax
              style={{ margin: "auto", height: "100%" }}
              scrolling={"no"}
            />
          ) : (
            <img
              // One problem with this is if images are too small, they'll get stretched by
              // the height 100%.
              //
              // Without stetching, images in Chrome will appear small and the jump to their
              // larger size when a larger srcset image is loaded.
              className="m-auto h-full object-contain"
              loading="eager"
              // set key to forcefull replace DOM node.
              key={formatImg(props.imageUrl)}
              src={formatImg(props.imageUrl)}
              onLoad={(e) => {
                if (props.contentType.startsWith("image/")) {
                  // The common imigx format `src` will be in browser cache from the
                  // initial recipe page load. onLoad should then trigger loading a
                  // larger image by setting the `srcset`.
                  //
                  // We can't set the `srcset` initially, because Safari will show
                  // no image until it loads a larger image. By setting the `src`
                  // and waiting to set `srcset`, we'll see an image immediately in
                  // the gallery, served from cache.
                  e.currentTarget.srcset = buildGallerySrcSetUrls(
                    props.imageUrl,
                  )
                }
              }}
              onClick={onClick}
            />
          )}
        </div>
        <div className="pointer-events-none absolute top-0 grid h-full w-full flex-col p-2">
          <div className="col-span-full row-span-full mb-auto flex w-full justify-between">
            <GalleryButton className="mr-auto" onClick={props.onStar}>
              <Star color={starColor} fill={starColor} />
            </GalleryButton>
            <a
              target="_blank"
              rel="noopener noreferrer"
              href={props.imageUrl}
              className="pointer-events-auto ml-auto rounded-md !border-none px-3 py-[calc(0.375em-1px)] text-white !shadow-none backdrop-blur-[10px] [background-color:rgba(0,0,0,0.46)]"
            >
              <Share />
            </a>
            <GalleryButton className="ml-2" onClick={props.onClose}>
              <X />
            </GalleryButton>
          </div>
          <div className="my-auto flex w-full justify-between [grid-area:1/1]">
            {props.hasPrevious && (
              <GalleryButton onClick={props.onPrevious} className="mr-auto">
                <ChevronLeft />
              </GalleryButton>
            )}
            {props.hasNext && (
              <GalleryButton onClick={props.onNext} className="ml-auto">
                <ChevronRight />
              </GalleryButton>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
