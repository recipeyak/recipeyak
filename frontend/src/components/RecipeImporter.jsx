import React from 'react'

import './RecipeImporter.scss'

class RecipeImporter extends React.Component {
  constructor () {
    super()
    this.state = {
      isLink: true
    }
  }

  render () {
    const { isLink } = this.state

    const linkSection = (
      <section>
        <div className="field">
          <div className="control">
            <input
              className="input"
              type="url"
              placeholder="http://recipewebsite.com/example/1"
              required
            />
          </div>
        </div>

        <p className="control">
          <button className="button is-primary">
            Fetch
          </button>
        </p>
      </section>
    )

    const uploadSection = (
      <section>
        <div className="field">
          <div className="control file-upload-container">
            <input
              className="input--file"
              type="file"
              multiple
              required
            />
          </div>
        </div>

        <p className="control">
          <button className="button is-primary">
            Upload
          </button>
        </p>
      </section>
    )

    return (
      <section className="box">
        <h2 className="title is-3">Recipe Importer</h2>

        <div className="tabs is-boxed">
          <ul>
            <li onClick={ () => this.setState({ isLink: true }) }
                className={ isLink ? 'is-active' : '' }>
              <a>
                <span>Link</span>
              </a>
            </li>
            <li onClick={ () => this.setState({ isLink: false }) }
              className={ !isLink ? 'is-active' : '' }>
              <a>
                <span>Upload</span>
              </a>
            </li>
          </ul>
        </div>
        { isLink && linkSection }
        { !isLink && uploadSection }
      </section>
    )
  }
}

export default RecipeImporter
