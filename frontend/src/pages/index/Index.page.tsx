import { useIsLoggedIn } from "@/hooks"
import LandingPage from "@/pages/index/LandingPage"
import { UserHome } from "@/pages/index/UserHome"

export const HomePage = () => {
  const loggedIn = useIsLoggedIn()
  if (loggedIn) {
    return <UserHome />
  }
  return <LandingPage />
}
