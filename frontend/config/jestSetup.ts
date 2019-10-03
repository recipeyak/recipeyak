import { configure } from "enzyme"
import Adapter from "enzyme-adapter-react-16"
import "jest-styled-components"

// see: http://airbnb.io/enzyme/docs/installation/#working-with-react-16
configure({ adapter: new Adapter() })
