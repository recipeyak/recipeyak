import React from 'react'

import Navbar from '../containers/Nav.jsx'

const Base = ({ children }) => (
  <div className="container pl-4 pr-4">
    <Navbar />
    <div className="pb-4 pt-0">
      { children }
    </div>
  </div>
)

export default Base
