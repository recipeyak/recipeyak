import React from 'react'

export const ButtonLink = ({
  className = '',
  ...props
}) =>
  <ButtonPlain
    className={ className + ' is-link' }
    { ...props }
  />

export const ButtonPrimary = ({
  className = '',
  ...props
}) =>
  <ButtonPlain
    className={ className + ' is-primary' }
    { ...props }
  />

export const ButtonDanger = ({
  className = '',
  ...props
}) =>
  <ButtonPlain
    className={ className + ' is-danger' }
    { ...props }
  />

export const ButtonPlain = ({
  loading = false,
  type = 'button',
  className = '',
  children,
  ...props
}) =>
  <button
    type={ type }
    className={ `my-button ${className} ${loading ? 'is-loading' : ''}`}
    { ...props }>
    { children }
  </button>
