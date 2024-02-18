import { clx } from "@/classnames"
import { formatImg } from "@/url"

export function FilePreview({
  src,
  isLoading,
  backgroundUrl,
  contentType,
  onClick,
}: {
  src: string
  contentType: string
  isLoading?: boolean
  backgroundUrl: string | null
  onClick?: () => void
}) {
  return (
    <div
      className="grid rounded-md bg-[--color-background-empty-image] print:!hidden"
      onClick={onClick}
    >
      <img
        className={clx(
          "z-10 h-[100px] w-[100px] rounded-md object-cover [grid-area:1/1]",
          isLoading && "grayscale",
        )}
        loading="lazy"
        src={contentType.startsWith("image/") ? formatImg(src) : src}
      />
      {backgroundUrl != null && (
        <div
          // eslint-disable-next-line no-restricted-syntax
          style={{
            // TODO: could use a css var
            backgroundImage: `url(${backgroundUrl})`,
          }}
          className="relative h-[100px] w-[100px] rounded-md bg-cover bg-center bg-no-repeat object-cover [grid-area:1/1] after:pointer-events-none after:absolute after:h-full after:w-full after:rounded-md after:backdrop-blur-[6px] after:content-['']"
        />
      )}
    </div>
  )
}
