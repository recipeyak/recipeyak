import { useMutation } from "@tanstack/react-query"

import { uploadComplete } from "@/api/uploadComplete"
import { uploadStart } from "@/api/uploadStart"
import { http } from "@/http"
import { isOk } from "@/result"

export function useUploadCreate() {
  return useMutation({
    mutationFn: (params: Parameters<typeof uploadCreateFull>[0]) =>
      uploadCreateFull(params),
  })
}

const uploadCreateFull = async ({
  file,
  onProgress,
  ...params
}: { file: File; onProgress?: (_: number) => void } & (
  | {
      recipeId: number
      purpose: "recipe"
    }
  | {
      purpose: "profile"
    }
)) => {
  const res = await uploadStart({
    file_name: file.name,
    content_type: file.type,
    content_length: file.size,
    purpose: params.purpose,
    ...(params.purpose === "profile" ? {} : { recipe_id: params.recipeId }),
  })
  // TODO: use the non-wrapped http method
  const uploadRes = await http.put(res.upload_url, file, {
    headers: {
      ...res.upload_headers,
      "Content-Type": file.type,
    },
    onUploadProgress(progressEvent: { loaded: number; total: number }) {
      onProgress?.((progressEvent.loaded / progressEvent.total) * 100)
    },
  })
  if (!isOk(uploadRes)) {
    throw uploadRes.error
  }
  const uploadFinished = await uploadComplete({
    upload_id: res.id,
  })
  return uploadFinished
}
