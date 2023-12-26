
import { useMutation } from "@tanstack/react-query"

import { httpx } from "@/http"

export function useTeamDelete() {
  return useMutation({
    mutationFn: teamDelete,
  })
}

// AUTOGEN
function teamDelete(params: 
{
"offset": string
"limit": string
"some_id": string
"ids_with_str": string
"ids_with_int": string
"team_id": string
}
): Promise<
void
> {
return httpx({
    method: 'delete',
    url: `teams/${params.team_id}`,
    params,
})
}
    