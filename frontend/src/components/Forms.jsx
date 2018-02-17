import React from 'react'

export const FormErrorHandler = ({ error }) =>
  !!error &&
    <div className="help is-danger">
      <ul>
        {
          error.map(e =>
            <li key={e}>
              {e}
            </li>
          )
        }
      </ul>
    </div>
