import { useMutation } from "@tanstack/react-query"

import { httpx } from "@/http"

export function useTeamUpdate() {
  return useMutation({
    mutationFn: teamUpdate,
  })
}

// AUTOGEN
function teamUpdate(params: 
{
"offset": string
"limit": string
"some_id": string
"ids_with_str": string
"ids_with_int": string
"team_id": string
}
): Promise<
{
"id": string
"name": string
"tags": string
"members": string
}
> {
return httpx({
    method: 'patch',
    url: `teams/${params.team_id}`,
    params,
})
}
    