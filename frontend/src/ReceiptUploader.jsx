import React from 'react'

const ReceiptUploader = () => (

  <section className="box">
    <h2 className="title is-3">Receipt Uploader</h2>

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

  </section>

)

export default ReceiptUploader
