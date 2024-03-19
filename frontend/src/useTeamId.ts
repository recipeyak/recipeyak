import { useUserFetch } from "@/queries/useUserFetch"

export function useTeamId(): number {
  const res = useUserFetch()
  // TODO: put this in the preload so we can avoid this
  return res.data?.schedule_team ?? -1
}
