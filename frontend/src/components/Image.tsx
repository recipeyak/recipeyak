import { useRef } from "react"

import { clx } from "@/classnames"
import { imgixFmt } from "@/url"
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
  return (
    <div
      ref={ref}
      onClick={onClick}
      style={{
        // TODO: could use css variables and a tailwind class
        minWidth: width != null ? width : "100%",
        minHeight: height != null ? height : "100%",
      }}
      className={clx(
        "relative bg-[var(--color-background-empty-image)]",
        rounded && "rounded-md",
        roundDesktop && "sm:rounded-md",
      )}
      aria-label={rest.ariaLabel}
    >
      {sources != null && isVisible && (
        <>
          <img
            src={imgixFmt(sources.url ?? "")}
            loading={loading}
            className={clx(
              "absolute z-[1] h-full w-full object-cover",
              rounded && "rounded-md",
              roundDesktop && "sm:rounded-md",
              grayscale && "grayscale",
            )}
          />
          <div
            style={{
              // TODO: we could use a css variable and a css class, style injects the variable
              backgroundImage: sources.backgroundUrl
                ? `url(${sources.backgroundUrl})`
                : undefined,
            }}
            className={clx(
              "w-100 h-100 relative bg-cover bg-center",
              rounded && "rounded-md",
              roundDesktop && "sm:rounded-md",
              grayscale && "grayscale",
              blur != null &&
                "after:pointer-events-none after:absolute after:h-full after:w-full after:backdrop-blur-[6px] after:content-['']",
              blur != null && (rounded || roundDesktop) && "after:rounded-md",
            )}
          />
        </>
      )}
    </div>
  )
}
