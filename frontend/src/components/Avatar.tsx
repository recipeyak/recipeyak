import React from "react"
import { classNames } from "@/classnames"
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
      <div
        onClick={onClick}
        className={classNames("user-profile-image", className)}
        tabIndex={tabIndex}
      />
    )
  }
  return (
    <img
      onClick={onClick}
      src={avatarURL}
      className={classNames("user-profile-image", className)}
      tabIndex={tabIndex}
      alt="avatar"
    />
  )
}
