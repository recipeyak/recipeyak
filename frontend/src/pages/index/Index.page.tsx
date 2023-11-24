import { ContainerBase } from "@/components/Base"
import { useIsLoggedIn } from "@/hooks"
import LandingPage from "@/pages/index/LandingPage"
import UserHome from "@/pages/index/UserHome"

const Home = () => {
  const loggedIn = useIsLoggedIn()
  return (
    <ContainerBase includeSearch={false}>
      {loggedIn ? <UserHome /> : <LandingPage />}
    </ContainerBase>
  )
}

export default Home
