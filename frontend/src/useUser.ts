import { useUserFetch } from "@/queries/userFetch"

export function useUser() {
  const res = useUserFetch()
  return {
    id: res.data?.id ?? null,
    avatarURL: res.data?.avatar_url ?? "",
    email: res.data?.email ?? "",
    name: res.data?.name ?? "",
    scheduleTeamID: res.data?.schedule_team ?? null,
  }
}
