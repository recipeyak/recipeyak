import { assertNever } from "@/assert"
import { clx } from "@/classnames"

const avatarCss =
  "max-h-none rounded-full bg-[var(--color-background-empty-image)] print:!hidden"

function UserProfileImage({
  onClick,
  tabIndex,
  className: cls,
  size,
  ...rest
}: {
  onClick: (() => void) | undefined
  tabIndex?: number
  className?: string
  size: 30 | 72 | 96
  src: string
  alt: string
}) {
  const className = clx(cls, avatarCss)
  return (
    <img
      className={className}
      onClick={onClick}
      tabIndex={tabIndex}
      width={size}
      height={size}
      alt={rest.alt}
      src={rest.src}
    />
  )
}

function UserProfileImagePlaceholder({
  onClick,
  tabIndex,
  className: cls,
  size,
}: {
  onClick: (() => void) | undefined
  tabIndex?: number
  className?: string
  size: 30 | 72 | 96
}) {
  const className = clx(
    cls,
    avatarCss,
    size === 30
      ? "h-[30px] w-[30px] min-w-[30px]"
      : size === 72
        ? "h-[70px] w-[70px] min-w-[70px]"
        : size === 96
          ? "h-[96px] w-[96px] min-w-[96px]"
          : assertNever(size),
  )

  return <div className={className} onClick={onClick} tabIndex={tabIndex} />
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
  size?: 30 | 72 | 96
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
