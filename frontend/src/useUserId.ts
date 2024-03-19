import { useUserFetch } from "@/queries/useUserFetch"

export function useUserId(): number | null {
  const res = useUserFetch()
  return res.data?.id ?? null
}
