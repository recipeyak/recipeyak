
import { useMutation } from "@tanstack/react-query"

import { httpx } from "@/http"

export function useTeamCreate() {
  return useMutation({
    mutationFn: teamCreate,
  })
}

// AUTOGEN
function teamCreate(params: 
{
"offset": string
"limit": string
"some_id": string
"ids_with_str": string
"ids_with_int": string
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
    method: 'post',
    url: ``,
    params,
})
}
    