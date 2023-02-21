import React from "react"

import cls from "@/classnames"
import { CloseButton } from "@/components/CloseButton"
import { TextInput } from "@/components/Forms"

export function TagEditor({
  tags,
  onChange,
  className,
}: {
  readonly tags: string[]
  readonly onChange: (_: string[]) => void
  readonly className?: string
}) {
  const [newTag, setNewTag] = React.useState("")
  function handleNewTag(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key !== "Enter") {
      return
    }

    onChange([...tags, newTag])
    setNewTag("")
  }
  return (
    <div className={cls("d-flex", className)}>
      <div className="d-flex align-center">
        {tags?.map((tag) => (
          <span className="tag fw-normal" key={tag}>
            {tag}{" "}
            <CloseButton
              onClose={() => {
                onChange(tags.filter((x) => x !== tag))
              }}
            />
          </span>
        ))}
      </div>
      <TextInput
        className="ml-2 max-width-200px"
        placeholder="new tag"
        value={newTag}
        onChange={(e) => {
          setNewTag(e.target.value)
        }}
        onKeyDown={handleNewTag}
      />
    </div>
  )
}
