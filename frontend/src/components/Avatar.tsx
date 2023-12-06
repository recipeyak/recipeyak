function UserProfileImage({
  onClick,
  tabIndex,
  ...rest
}: {
  onClick: (() => void) | undefined
  tabIndex?: number
} & ({ as: "img"; src: string; alt: string } | { as?: undefined })) {
  const className =
    "m-[5px] h-[30px] max-h-none w-[30px] min-w-[30px] rounded-full bg-[rgb(240,240,240)] print:!hidden"
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
}
export function Avatar({ avatarURL, onClick }: IAvatarProps) {
  if (avatarURL == null) {
    return <UserProfileImage onClick={onClick} />
  }
  return (
    <UserProfileImage as="img" onClick={onClick} src={avatarURL} alt="avatar" />
  )
}
