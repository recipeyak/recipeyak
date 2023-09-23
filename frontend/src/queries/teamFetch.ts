import { useQuery } from "@tanstack/react-query"

import { http } from "@/http"
import { IUser } from "@/queries/userFetch"
import { unwrapResult } from "@/query"

export interface IMember {
  readonly id: number
  readonly user: IUser
  readonly level: "admin" | "contributor" | "read"
  readonly deleting?: boolean
  readonly is_active: boolean
}

export interface ITeam {
  readonly id: number
  readonly name: string
  readonly updating?: boolean
  readonly sendingTeamInvites?: boolean
  readonly loadingTeam?: boolean
  readonly loadingMembers?: boolean
  readonly error404?: boolean
  readonly recipes?: number[]
  readonly members: {
    readonly [key: number]: IMember | undefined
  }
}

const getTeam = (id: ITeam["id"]) => http.get<ITeam>(`/api/v1/t/${id}/`)

export function useTeam({ teamId }: { teamId: number }) {
  return useQuery({
    queryKey: ["teams", teamId],
    queryFn: () => getTeam(teamId).then(unwrapResult),
  })
}
