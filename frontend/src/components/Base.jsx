import React from 'react'
import { Helmet } from 'react-helmet'

import Navbar from '../containers/Nav.jsx'

export const ContainerBase = ({ children }) =>
  <div>
    <Helmet
      defaultTitle='Recipe Yak'
      titleTemplate='%s | Recipe Yak'
    />
    <Navbar className="container pl-4 pr-4" />
    { children }
  </div>

export const Container = ({ children }) =>
  <div className="pb-4 pt-0 container pl-4 pr-4">
    { children }
  </div>

export default Container
