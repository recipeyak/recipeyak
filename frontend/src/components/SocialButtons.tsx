import * as React from 'react'

import {
  GITHUB_OAUTH_URL,
  GITLAB_OAUTH_URL,
} from '../settings'

import { FormErrorHandler } from './Forms'

import githubIcon from './images/github-logo.svg'
import githubIconWhite from './images/github-logo-white.svg'
import gitlabIcon from './images/gitlab-logo.svg'
import gitlabIconWhite from './images/gitlab-logo-white.svg'

export const GithubImg = () =>
  <img className="mr-2" src={ githubIcon } alt="github icon"/>
export const GitlabImg = () =>
  <img className="mr-2" src={ gitlabIcon } alt="gitlab icon"/>

export const Github = ({ disable = false }) => GITHUB_OAUTH_URL &&
  <a href={ !disable && GITHUB_OAUTH_URL } className="github-button">
    <img className="mr-2" src={ githubIconWhite } alt="github icon"/>
  </a>

export const Gitlab = () => GITLAB_OAUTH_URL &&
  <a href={ GITLAB_OAUTH_URL } className="gitlab-button">
    <img className="mr-2" src={ gitlabIconWhite } alt="gitlab icon"/>
  </a>

const enableSocialButtons = GITHUB_OAUTH_URL || GITLAB_OAUTH_URL

interface ISocialButtons {
  nonFieldErrors?: string[]
  emailError?: string[]
  signup?: boolean
}
const SocialButtons = ({ nonFieldErrors, emailError, signup = true }: ISocialButtons) =>
  enableSocialButtons &&
  <div>
    { signup && <div className="d-flex align-items-center mb-2 mt-1">
      <span className="or-bar"></span> or <span className="or-bar"></span>
    </div> }
    <div className="d-grid grid-template-column-2-1fr grid-gap-3">
      <Github/>
      <Gitlab/>
    </div>
    <FormErrorHandler error={nonFieldErrors}/>
    <FormErrorHandler error={emailError}/>
  </div>

export default SocialButtons
