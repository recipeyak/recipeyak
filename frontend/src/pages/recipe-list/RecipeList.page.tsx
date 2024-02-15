import { NavPage } from "@/components/Page"
import { RecipeSearchList } from "@/pages/recipe-list/RecipeListSearch"

export function RecipeListPage() {
  return (
    <NavPage includeSearch={false} title="Browse">
      <RecipeSearchList />
    </NavPage>
  )
}
