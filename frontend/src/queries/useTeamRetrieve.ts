
import { useQuery } from "@tanstack/react-query"

import { httpx } from "@/http"

export function useTeamRetrieve() {
  return useQuery({
    // TODO: setup query key
    // queryKey: ['teamRetrieve'],
    queryFn: teamRetrieve,
  })
}

// AUTOGEN
function teamRetrieve(params: 
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
    method: 'get',
    url: `teams/${params.team_id}`,
    params,
})
}
    