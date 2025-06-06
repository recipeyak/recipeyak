import { ChannelProvider } from "ably/react"

import { NavPage } from "@/components/Page"
import { Calendar } from "@/pages/schedule/Calendar"
import { useTeamId } from "@/useTeamId"

export function SchedulePage() {
  const teamId = useTeamId()
  return (
    <ChannelProvider channelName={`team:${teamId}:scheduled_recipe`}>
      <NavPage noContainer title="Schedule">
        <div className="order-2 flex h-[calc(100vh-3rem)] grow px-2 pt-2 sm:pt-0">
          <Calendar />
        </div>
      </NavPage>
    </ChannelProvider>
  )
}
