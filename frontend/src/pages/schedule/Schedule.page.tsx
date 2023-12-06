import { Helmet } from "@/components/Helmet"
import { NavPage } from "@/components/Page"
import { RecipeSearchList } from "@/components/RecipeSearchList"
import Calendar from "@/pages/schedule/Calendar"
import HelpMenuModal from "@/pages/schedule/HelpMenuModal"

function Sidebar() {
  return (
    <div className="mr-2 hidden w-[250px] min-w-[250px] shrink-0 auto-rows-min gap-2 sm:grid">
      <RecipeSearchList scroll drag noPadding />
    </div>
  )
}

export function SchedulePage() {
  return (
    <NavPage includeSearch={false} noContainer>
      <div className="flex h-[calc(100vh-3rem)] grow px-2">
        <Helmet title="Schedule" />
        <Sidebar />
        <Calendar />
        <HelpMenuModal />
      </div>
    </NavPage>
  )
}
