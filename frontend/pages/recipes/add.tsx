import AddRecipe from "@/containers/AddRecipe"

import { Container, ContainerBase } from "@/components/Base"

function HomePage() {
  return (
    <ContainerBase>
      <Container>
        <AddRecipe />
      </Container>
    </ContainerBase>
  )
}

export default HomePage
