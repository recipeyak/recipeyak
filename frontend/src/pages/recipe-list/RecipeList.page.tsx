import { NavPage } from "@/components/Page"
import { RecipeSearchList } from "@/components/RecipeSearchList"

export function RecipeListPage() {
  return (
    <NavPage includeSearch={false}>
      <RecipeSearchList />
    </NavPage>
  )
}
