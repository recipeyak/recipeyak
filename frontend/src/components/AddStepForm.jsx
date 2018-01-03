import React from 'react'
import Textarea from 'react-textarea-autosize'

const AddStepForm = ({
  handleInputChange,
  addStep,
  cancelAddStep,
  stepNumber,
  text,
  loading = false,
  error = false
}) =>
  <form onSubmit={ e => {
    e.preventDefault()
    if (text === '') return
    addStep()
  }}>
    <div className="field">
      <label className="better-label">Step { stepNumber }</label>
      <div className="control mt-2">
        <Textarea
          onChange={ handleInputChange }
          onKeyPress={ e => {
            if (text === '') return
            if (e.shiftKey && e.key === 'Enter') {
              e.preventDefault()
              addStep()
            }
          }}
          value={ text }
          className={ 'my-textarea' + (error ? ' is-danger' : '') }
          placeholder="Add your step here"
          name="step"/>
        { error
            ? <p class="fs-4 c-danger">A step is required</p>
            : null
        }
      </div>
    </div>
    <div className="field is-grouped">
      <p className="control">
        <button
          disabled={ text === '' }
          className={ 'my-button is-primary' + (loading ? ' is-loading' : '') }
          type="submit"
          name="save step">
          Add
        </button>
      </p>
      { text !== ''
          ? <p className="control">
            <input
              onClick={ cancelAddStep }
              className='my-button'
              type="button"
              name="cancel step"
              value="✕"/>
          </p>
          : null
      }
    </div>
  </form>

export default AddStepForm
