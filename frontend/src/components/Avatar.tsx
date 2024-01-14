import { assertNever } from "@/assert"
import { clx } from "@/classnames"
import { imgixFmt } from "@/url"

const avatarCss =
  "max-h-none rounded-full object-cover bg-[--color-background-empty-image] print:!hidden"

function UserProfileImage({
  onClick,
  tabIndex,
  className,
  size,
  alt,
  src,
}: {
  onClick: (() => void) | undefined
  tabIndex?: number
  className?: string
  size: 20 | 30 | 72 | 96
  src: string
  alt: string
}) {
  return (
    <img
      className={clx(className, getAvatarCss(size))}
      onClick={onClick}
      tabIndex={tabIndex}
      width={size}
      height={size}
      alt={alt}
      src={imgixFmt(src)}
    />
  )
}

function UserProfileImagePlaceholder({
  onClick,
  tabIndex,
  className,
  size,
}: {
  onClick: (() => void) | undefined
  tabIndex?: number
  className?: string
  size: 20 | 30 | 72 | 96
}) {
  return (
    <div
      className={clx(className, getAvatarCss(size))}
      onClick={onClick}
      tabIndex={tabIndex}
    />
  )
}

function getAvatarCss(size: 20 | 30 | 72 | 96) {
  return clx(
    avatarCss,
    size === 20
      ? "h-[20px] w-[20px] min-w-[20px]"
      : size === 30
        ? "h-[30px] w-[30px] min-w-[30px]"
        : size === 72
          ? "h-[70px] w-[70px] min-w-[70px]"
          : size === 96
            ? "h-[96px] w-[96px] min-w-[96px]"
            : assertNever(size),
  )
}

export function Avatar({
  avatarURL,
  onClick,
  tabIndex,
  size = 30,
}: {
  avatarURL: string | null
  onClick?: () => void
  tabIndex?: number
  size?: 20 | 30 | 72 | 96
}) {
  const cls = clx(onClick != null && "cursor-pointer")
  if (avatarURL == null) {
    return (
      <UserProfileImagePlaceholder
        size={size}
        onClick={onClick}
        tabIndex={tabIndex}
      />
    )
  }
  return (
    <UserProfileImage
      onClick={onClick}
      size={size}
      src={avatarURL}
      alt="avatar"
      tabIndex={tabIndex}
      className={cls}
    />
  )
}
