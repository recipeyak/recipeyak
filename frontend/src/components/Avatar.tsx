import { styled } from "@/theme"

const UserProfileImage = styled.div`
  background-color: rgb(240, 240, 240);
  height: 30px;
  width: 30px;
  min-width: 30px;
  margin: 5px;
  border-radius: 100%;
  max-height: none;
`

interface IAvatarProps {
  readonly avatarURL: string | null
  readonly className?: string
  readonly onClick?: () => void
  readonly tabIndex?: number
}
export function Avatar({
  className,
  avatarURL,
  onClick,
  tabIndex,
}: IAvatarProps) {
  if (avatarURL == null) {
    return (
      <UserProfileImage
        onClick={onClick}
        className={className}
        tabIndex={tabIndex}
      />
    )
  }
  return (
    <UserProfileImage
      as="img"
      onClick={onClick}
      src={avatarURL}
      className={className}
      tabIndex={tabIndex}
      alt="avatar"
    />
  )
}
