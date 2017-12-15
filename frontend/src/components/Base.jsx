import React from 'react'
import { Helmet } from 'react-helmet'

import Navbar from '../containers/Nav.jsx'

const Base = ({ children }) => (
  <div className="container pl-4 pr-4">
    <Helmet
      defaultTitle='Recipe Yak'
      titleTemplate='%s | Recipe Yak'
    />
    <Navbar />
    <div className="pb-4 pt-0">
      { children }
    </div>
  </div>
)

export default Base
