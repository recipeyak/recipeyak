import LandingPage from "@/components/LandingPage"
import UserHome from "@/components/UserHome"

const Home = ({ loggedIn }: { loggedIn: boolean }) =>
  loggedIn ? <UserHome /> : <LandingPage />

export default Home
