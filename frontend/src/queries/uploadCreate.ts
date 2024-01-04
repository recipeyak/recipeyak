import { useMutation } from "@tanstack/react-query"

import { http } from "@/http"
import { unwrapResult } from "@/query"
import { isOk, Ok } from "@/result"

export function useUploadCreate() {
  return useMutation({
    mutationFn: (params: Parameters<typeof uploadCreate>[0]) =>
      uploadCreate(params).then(unwrapResult),
  })
}

const uploadCreate = async ({
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
  const res = await http.post<{
    id: string
    upload_url: string
    upload_headers: Record<string, string>
  }>(`/api/v1/upload/`, {
    file_name: file.name,
    content_type: file.type,
    content_length: file.size,
    purpose: params.purpose,
    ...(params.purpose === "profile" ? {} : { recipe_id: params.recipeId }),
  })
  if (!isOk(res)) {
    return res
  }
  const uploadRes = await http.put(res.data.upload_url, file, {
    headers: {
      ...res.data.upload_headers,
      "Content-Type": file.type,
    },
    onUploadProgress(progressEvent: { loaded: number; total: number }) {
      onProgress?.((progressEvent.loaded / progressEvent.total) * 100)
    },
  })
  if (!isOk(uploadRes)) {
    return uploadRes
  }

  const uploadFinished = await http.post<{
    id: string
    url: string
    contentType: string
  }>(`/api/v1/upload/${res.data.id}/complete`)
  if (!isOk(uploadFinished)) {
    return uploadFinished
  }
  return Ok(uploadFinished.data)
}
