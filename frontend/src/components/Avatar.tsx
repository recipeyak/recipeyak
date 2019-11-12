import React from "react"
import { classNames } from "@/classnames"
interface IAvatarProps {
  readonly avatarURL: string
  readonly className?: string
}
export function Avatar({ className, avatarURL }: IAvatarProps) {
  return (
    <div className={classNames("w-50px d-flex align-items-center", className)}>
      <img src={avatarURL} className="br-10-percent" alt="avatar" />
    </div>
  )
}
