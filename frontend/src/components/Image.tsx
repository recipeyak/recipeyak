import { useRef } from "react"

import { clx } from "@/classnames"
import { formatImg, formatImgSmall } from "@/url"
import { useIntersectionObserver } from "@/useIntersectionObserver"

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
  lazyLoad,
  size: imgx,
  ...rest
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
  readonly lazyLoad?: boolean
  readonly size: "small" | "large" | "original"
  ariaLabel?: string
}) {
  const ref = useRef<HTMLDivElement | null>(null)
  const entry = useIntersectionObserver(ref, sources?.url, {
    // How much to expand element's margin before calculating intersections
    // Means we load images before they're in view so there isn't a pop in.
    //
    // NOTE: Might need to tweak this, maybe consider scroll velocity?
    rootMargin: "500px",
  })
  const isVisible = !lazyLoad || entry?.isIntersecting

  const formatSource = (source: string) => {
    switch (imgx) {
      case "large": {
        return formatImg(source)
      }
      case "small": {
        return formatImgSmall(source)
      }
      case "original": {
        return source
      }
    }
  }
  return (
    <div
      ref={ref}
      onClick={onClick}
      // eslint-disable-next-line no-restricted-syntax
      style={{
        // TODO: could use css variables and a tailwind class
        ...(width != null
          ? {
              minWidth: width,
            }
          : {
              width: "100%",
            }),
        ...(height != null
          ? {
              minHeight: height,
            }
          : {
              height: "100%",
            }),
      }}
      className={clx(
        "relative bg-[--color-background-empty-image]",
        rounded && "rounded-md",
        roundDesktop && "sm:rounded-md",
      )}
      aria-label={rest.ariaLabel}
    >
      {sources != null && isVisible && (
        <>
          <img
            src={formatSource(sources.url ?? "")}
            loading={loading}
            // set key to forcefull replace DOM node.
            key={formatSource(sources.url ?? "")}
            className={clx(
              "absolute z-[1] h-full w-full object-cover",
              rounded && "rounded-md",
              roundDesktop && "sm:rounded-md",
              grayscale && "grayscale",
            )}
          />
          <div
            // set key to forcefull replace DOM node.
            key={sources.backgroundUrl ?? ""}
            // eslint-disable-next-line no-restricted-syntax
            style={{
              // eslint-disable-next-line @typescript-eslint/consistent-type-assertions
              ["--backgroundImage" as string]: sources.backgroundUrl
                ? `url(${sources.backgroundUrl})`
                : undefined,
            }}
            className={clx(
              "absolute bottom-0 left-0 right-0 top-0 bg-cover bg-center",
              // kind of tricky: https://stackoverflow.com/a/70810692/3720597
              "bg-[image:--backgroundImage]",
              rounded && "rounded-md",
              roundDesktop && "sm:rounded-md",
              grayscale && "grayscale",
              blur !== "none" &&
                "after:pointer-events-none after:absolute after:h-full after:w-full after:backdrop-blur-[6px] after:content-['']",
              blur !== "none" &&
                (rounded || roundDesktop) &&
                "after:rounded-md",
            )}
          />
        </>
      )}
    </div>
  )
}
