import { NavPage } from "@/components/Page"
import { Calendar } from "@/pages/schedule/Calendar"

export function SchedulePage() {
  return (
    <NavPage noContainer title="Schedule">
      <div className="flex h-[calc(100vh-3rem)] grow px-2">
        <Calendar />
      </div>
    </NavPage>
  )
}
