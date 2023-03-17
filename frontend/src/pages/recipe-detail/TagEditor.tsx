import React from "react"

import { Box } from "@/components/Box"
import { CloseButton } from "@/components/CloseButton"
import { TextInput } from "@/components/Forms"
import { Tag } from "@/components/Tag"

export function TagEditor({
  tags,
  onChange,
}: {
  readonly tags: string[]
  readonly onChange: (_: string[]) => void
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
    <Box align="center" gap={2}>
      {tags?.map((tag) => (
        <Tag fontWeight="normal" key={tag}>
          {tag}{" "}
          <CloseButton
            onClose={() => {
              onChange(tags.filter((x) => x !== tag))
            }}
          />
        </Tag>
      ))}
      <TextInput
        className="max-width-200px"
        placeholder="new tag"
        value={newTag}
        onChange={(e) => {
          setNewTag(e.target.value)
        }}
        onKeyDown={handleNewTag}
      />
    </Box>
  )
}
