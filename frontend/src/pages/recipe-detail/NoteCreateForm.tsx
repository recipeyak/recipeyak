import { useRef, useState } from "react"

import { Button } from "@/components/Buttons"
import { Textarea } from "@/components/Textarea"
import { FileUploader } from "@/pages/recipe-detail/FileUploader"
import { UploadSuccess } from "@/pages/recipe-detail/Notes"
import { UploadContainer } from "@/pages/recipe-detail/UploadContainer"
import { useFileUpload } from "@/pages/recipe-detail/useFileUpload"
import { useNoteCreate } from "@/queries/useNoteCreate"
import { toast } from "@/toast"

export function NoteCreateForm({
  recipeId,
  className,
}: {
  recipeId: number
  className?: string
}) {
  const [draftText, setDraftText] = useState("")
  const [isEditing, setIsEditing] = useState(false)
  const [uploadedImages, setUploads] = useState<UploadSuccess[]>([])
  const ref = useRef<HTMLTextAreaElement>(null)

  const cancelEditingNote = () => {
    setIsEditing(false)
    setDraftText("")
    setUploads([])
    ref.current?.blur()
  }

  const createNote = useNoteCreate()

  const onCreate = async () => {
    try {
      await createNote.mutateAsync({
        recipeId,
        note: draftText,
        uploadIds: uploadedImages.map((x) => x.id),
      })
      cancelEditingNote()
    } catch (e) {
      toast.error("Problem adding note to recipe")
    }
    // ensure we clear out the local state of images
    reset()
  }
  const onCancel = () => {
    cancelEditingNote()
    reset()
  }
  const onEditorKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Escape") {
      cancelEditingNote()
    }
    if (e.key === "Enter" && e.metaKey) {
      void onCreate()
    }
  }
  const onEditorFocus = () => {
    setIsEditing(true)
  }
  const onEditorChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setDraftText(e.target.value)
  }

  const editorText = isEditing ? draftText : ""
  const editorRowCount = !isEditing ? 1 : undefined
  const editorMinRowCount = isEditing ? 5 : 0

  const isDisabled = editorText === "" && uploadedImages.length === 0
  const removeUploads = (localIds: string[]) => {
    setUploads((s) => {
      return s.filter((u) => u.localId == null || !localIds.includes(u.localId))
    })
  }
  const addUploads = (upload: UploadSuccess) => {
    setUploads((s) => [upload, ...s])
  }
  const resetUploads = () => {
    setUploads([])
  }

  const { addFiles, removeFile, files, hasUnsavedImages, reset } =
    useFileUpload(
      addUploads,
      removeUploads,
      uploadedImages,
      resetUploads,
      recipeId,
    )

  return (
    <div className={className}>
      <UploadContainer addFiles={addFiles}>
        <Textarea
          inputRef={ref}
          onKeyDown={onEditorKeyDown}
          minRows={editorMinRowCount}
          rows={editorRowCount}
          value={editorText}
          onFocus={onEditorFocus}
          onChange={onEditorChange}
          bottomFlat={isEditing}
          minimized={!isEditing}
          placeholder="Add a note..."
        />
        {isEditing && (
          <FileUploader
            addFiles={addFiles}
            removeFile={removeFile}
            files={files}
          />
        )}
      </UploadContainer>

      {isEditing && (
        <div className="flex items-center justify-end">
          <Button size="small" className="mr-3" onClick={onCancel}>
            Cancel
          </Button>
          <Button
            variant="primary"
            size="small"
            onClick={() => {
              void onCreate()
            }}
            loading={createNote.isPending}
            disabled={isDisabled || hasUnsavedImages}
          >
            {createNote.isPending ? "Adding Note..." : "Add Note"}
          </Button>
        </div>
      )}
    </div>
  )
}
