import { clx } from "@/classnames"

function UserProfileImage({
  onClick,
  tabIndex,
  className: cls,
  ...rest
}: {
  onClick: (() => void) | undefined
  tabIndex?: number
  className?: string
} & ({ as: "img"; src: string; alt: string } | { as?: undefined })) {
  const className = clx(
    cls,
    "h-[30px] max-h-none w-[30px] min-w-[30px] rounded-full bg-[rgb(240,240,240)] print:!hidden",
  )
  if (rest.as === "img") {
    return (
      <img
        className={className}
        onClick={onClick}
        tabIndex={tabIndex}
        alt={rest.alt}
        src={rest.src}
      />
    )
  }
  return <div className={className} onClick={onClick} tabIndex={tabIndex} />
}

interface IAvatarProps {
  readonly avatarURL: string | null
  readonly onClick?: () => void
  readonly tabIndex?: number
}
export function Avatar({ avatarURL, onClick, tabIndex }: IAvatarProps) {
  const cls = clx(onClick != null && "cursor-pointer")
  if (avatarURL == null) {
    return (
      <UserProfileImage onClick={onClick} tabIndex={tabIndex} className={cls} />
    )
  }
  return (
    <UserProfileImage
      as="img"
      onClick={onClick}
      src={avatarURL}
      alt="avatar"
      tabIndex={tabIndex}
      className={cls}
    />
  )
}
