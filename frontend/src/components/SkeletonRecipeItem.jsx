import React from 'react'

const skeletonCard = (
  <div className="card mb-0">
    <div className="card-content">
      <p className="title">
        <a className="letter-spacing-smushed">-------</a>
      </p>
      <p className="subtitle letter-spacing-smushed">
        -------
      </p>
      { /* TODO: once we get tags working, update this with tags */ }
      <div className="content"></div>

    </div>
    <footer className="card-footer">
      <div className="card-footer-item">
        <div className="field is-grouped">
          <button className='button control' disabled>Remove One</button>
          <button className='button is-primary control' disabled>Add Another</button>
          <span className="tag is-light is-medium cart-count-tag"></span>
        </div>
      </div>
    </footer>
  </div>
)

export default skeletonCard
