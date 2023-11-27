import { useUserFetch } from "@/queries/userFetch"

export function useUserId(): number | null {
  const res = useUserFetch()
  return res.data?.id ?? null
}
