import React from 'react'

import Footer from './Footer'
import Navbar from '../containers/Nav.jsx'

export const ContainerBase = ({ children }) =>
  <div>
    <Navbar className="container pl-3 pr-3" />
    { children }
    <Footer/>
  </div>

export const Container = ({ children }) =>
  <div className="pb-3 pt-0 container pl-3 pr-3">
    { children }
  </div>

export default Container
