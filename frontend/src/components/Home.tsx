import * as React from "react"

import LandingPage from "@/components/LandingPage"
import UserHome from "@/containers/UserHome"

const Home = ({ loggedIn }: { loggedIn: boolean }) =>
  loggedIn ? <UserHome /> : <LandingPage />

export default Home
