export function UploadContainer({
  addFiles,
  children,
}: {
  children: React.ReactNode
  addFiles: (files: FileList) => Promise<void>
}) {
  return (
    <div
      className="flex flex-col"
      onDragOver={(event) => {
        event.dataTransfer.dropEffect = "copy"
      }}
      onDrop={(event) => {
        if (event.dataTransfer?.files) {
          const newFiles = event.dataTransfer.files
          void addFiles(newFiles)
        }
      }}
    >
      {children}
    </div>
  )
}
