import React from 'react'

import Navbar from '../containers/Nav.jsx'

const Base = ({ children }) => (
  <div className="container">
    <Navbar />
    <section className="section">
      { children }
    </section>
  </div>
)

export default Base
