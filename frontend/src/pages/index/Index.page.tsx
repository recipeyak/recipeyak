import { useIsLoggedIn } from "@/hooks"
import LandingPage from "@/pages/index/LandingPage"
import UserHome from "@/pages/index/UserHome"

const Home = () => {
  const loggedIn = useIsLoggedIn()
  return loggedIn ? <UserHome /> : <LandingPage />
}

export default Home
