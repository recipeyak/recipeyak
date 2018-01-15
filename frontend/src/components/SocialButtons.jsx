import React from 'react'

import {
  GITHUB_OAUTH_URL,
  GITLAB_OAUTH_URL,
  BITBUCKET_OAUTH_URL,
  GOOGLE_OAUTH_URL,
  FACEBOOK_OAUTH_URL,
} from '../settings'

import githubIcon from './github-logo.svg'
import gitlabIcon from './gitlab-logo.svg'
import googleIcon from './google-logo.svg'
import bitbucketIcon from './bitbucket-logo.svg'
import facebookIcon from './facebook-logo.svg'

const Github = GITHUB_OAUTH_URL &&
  <a href={ GITHUB_OAUTH_URL } className="my-button">
    <img className="mr-2" src={ githubIcon } alt="github icon"/>
    Github
  </a>

const Gitlab = GITLAB_OAUTH_URL &&
  <a href={ GITLAB_OAUTH_URL } className="my-button">
    <img className="mr-2" src={ gitlabIcon } alt="gitlab icon"/>
    Gitlab
  </a>

const Bitbucket = BITBUCKET_OAUTH_URL &&
  <a href={ BITBUCKET_OAUTH_URL } className="my-button">
    <img className="mr-2" src={ bitbucketIcon } alt="bitbucket icon"/>
    Bitbucket
  </a>

const Google = GOOGLE_OAUTH_URL &&
  <a href={ GOOGLE_OAUTH_URL } className="my-button">
    <img className="mr-2" src={ googleIcon } alt="google icon"/>
    Google
  </a>

const Facebook = FACEBOOK_OAUTH_URL &&
  <a href={ FACEBOOK_OAUTH_URL } className="my-button">
    <img className="mr-2" src={ facebookIcon } alt="facebook icon"/>
    Facebook
  </a>

const enableSocialButtons = GITHUB_OAUTH_URL || GITLAB_OAUTH_URL || BITBUCKET_OAUTH_URL || GOOGLE_OAUTH_URL || FACEBOOK_OAUTH_URL

const SocialButtons = () => enableSocialButtons &&
  <div>
    <div className="d-flex align-items-center mb-2 mt-1">
      <span className="or-bar"></span> or <span className="or-bar"></span>
    </div>
    <div className="social-buttons">
      { Github }
      { Gitlab }
      { Bitbucket }
      { Google }
      { Facebook }
    </div>
  </div>

export default SocialButtons
