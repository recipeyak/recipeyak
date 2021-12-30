import Recipe from "@/components/Recipe"

import { DndProvider } from "react-dnd-cjs"
import HTML5Backend from "react-dnd-html5-backend-cjs"

import { GetStaticProps, GetStaticPaths, GetServerSideProps } from "next"

import { Container, ContainerBase } from "@/components/Base"

import { IRecipe } from "@/store/reducers/recipes"

function HomePage({ recipeId, recipe }: { recipeId: number; recipe: IRecipe }) {
  return (
    <DndProvider backend={HTML5Backend}>
      <ContainerBase>
        <Container>
          <Recipe recipeId={recipeId} recipe={recipe} />
        </Container>
      </ContainerBase>
    </DndProvider>
  )
}

export const getServerSideProps: GetServerSideProps = async (
  context,
): Promise<{
  props: React.ComponentProps<typeof HomePage>
}> => {
  const recipeId = parseInt(context.query.id, 10)

  const req = context.req

  const protocol = req.headers["x-forwarded-proto"] || "http"
  const baseUrl = req ? `${protocol}://${req.headers.host}` : ""

  const data = await fetch(baseUrl + `/api/v1/recipes/${recipeId}/`, {
    headers: {
      cookie: req.headers.cookie,
    },
  })
  const recipe = await data.json()
  return {
    props: {
      recipeId,
      recipe,
    },
  }
}

export default HomePage
