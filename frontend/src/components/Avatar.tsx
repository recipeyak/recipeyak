import React from "react"
import { classNames } from "@/classnames"
interface IAvatarProps {
  readonly avatarURL: string
  readonly className?: string
  readonly size?: 'sm' | 'lg'
}
export function Avatar({ className, avatarURL, size = 'lg' }: IAvatarProps) {
  return (
    <div className={classNames("d-flex align-items-center", className, {'w-50px': size === 'lg', 'w-20px': size === 'sm'})}>
      <img src={avatarURL} className="br-10-percent" alt="avatar" />
    </div>
  )
}
