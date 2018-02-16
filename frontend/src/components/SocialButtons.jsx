import React from 'react'

import {
  GITHUB_OAUTH_URL,
  GITLAB_OAUTH_URL,
  BITBUCKET_OAUTH_URL,
  GOOGLE_OAUTH_URL,
  FACEBOOK_OAUTH_URL,
} from '../settings'

import githubIcon from './images/github-logo.svg'
import gitlabIcon from './images/gitlab-logo.svg'
import googleIcon from './images/google-logo.svg'
import bitbucketIcon from './images/bitbucket-logo.svg'
import facebookIcon from './images/facebook-logo.svg'

export const GithubImg = () =>
  <img className="mr-2" src={ githubIcon } alt="github icon"/>
export const GitlabImg = () =>
  <img className="mr-2" src={ gitlabIcon } alt="gitlab icon"/>
export const GoogleImg = () =>
  <img className="mr-2" src={ googleIcon } alt="google icon"/>
export const BitbucketImg = () =>
  <img className="mr-2" src={ bitbucketIcon } alt="bitbucket icon"/>
export const FacebookImg = () =>
  <img className="mr-2" src={ facebookIcon } alt="facebook icon"/>

export const Github = ({ disable = false }) => GITHUB_OAUTH_URL &&
  <a href={ !disable && GITHUB_OAUTH_URL } className="my-button">
    <img className="mr-2" src={ githubIcon } alt="github icon"/>
    Github
  </a>

export const Gitlab = () => GITLAB_OAUTH_URL &&
  <a href={ GITLAB_OAUTH_URL } className="my-button">
    <img className="mr-2" src={ gitlabIcon } alt="gitlab icon"/>
    Gitlab
  </a>

export const Bitbucket = () => BITBUCKET_OAUTH_URL &&
  <a href={ BITBUCKET_OAUTH_URL } className="my-button">
    <img className="mr-2" src={ bitbucketIcon } alt="bitbucket icon"/>
    Bitbucket
  </a>

export const Google = () => GOOGLE_OAUTH_URL &&
  <a href={ GOOGLE_OAUTH_URL } className="my-button">
    <img className="mr-2" src={ googleIcon } alt="google icon"/>
    Google
  </a>

export const Facebook = () => FACEBOOK_OAUTH_URL &&
  <a href={ FACEBOOK_OAUTH_URL } className="my-button">
    <img className="mr-2" src={ facebookIcon } alt="facebook icon"/>
    Facebook
  </a>

const enableSocialButtons = GITHUB_OAUTH_URL || GITLAB_OAUTH_URL || BITBUCKET_OAUTH_URL || GOOGLE_OAUTH_URL || FACEBOOK_OAUTH_URL

const errorHandler = err =>
  !!err &&
  <div className="help is-danger">
    <ul>
      {err.map(e => (<li key={e}>{e}</li>))}
    </ul>
  </div>

const SocialButtons = ({ nonFieldErrors, emailError, signup = true }) => enableSocialButtons &&
  <div>
    { signup && <div className="d-flex align-items-center mb-2 mt-1">
      <span className="or-bar"></span> or <span className="or-bar"></span>
    </div> }
    <div className="social-buttons">
      <Github/>
      <Gitlab/>
      <Bitbucket/>
      <Google/>
      <Facebook/>
    </div>
    { errorHandler(nonFieldErrors) }
    { errorHandler(emailError) }
  </div>

export default SocialButtons
