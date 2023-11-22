import { useIsLoggedIn } from "@/hooks"
import LandingPage from "@/pages/index/LandingPage"
import UserHome from "@/pages/index/UserHome"

const Home = () => {
  const { isLoggedIn, isPending } = useIsLoggedIn()
  if (isPending) {
    return null
  }

  return isLoggedIn ? <UserHome /> : <LandingPage />
}

export default Home
