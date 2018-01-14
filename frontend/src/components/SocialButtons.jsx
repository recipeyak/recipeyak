import React from 'react'

import { GITHUB_OAUTH_URL } from '../settings'

import githubIcon from './github-logo.svg'
import gitlabIcon from './gitlab-logo.svg'
import googleIcon from './google-logo.svg'
import bitbucketIcon from './bitbucket-logo.svg'
import facebookIcon from './facebook-logo.svg'

const SocialButtons = () =>
<div>
  <div className="d-flex align-items-center mb-2 mt-1">
    <span className="or-bar"></span> or <span className="or-bar"></span>
  </div>
  <div className="social-buttons">
    <a href={ GITHUB_OAUTH_URL } className="my-button is-github"><img className="mr-2" src={ githubIcon } alt="github icon"/>Github</a>
    <button className="my-button" disabled>
      <img className="mr-2" src={gitlabIcon} alt="gitlab icon"/>
      Gitlab
    </button>
    <button className="my-button" disabled>
      <img className="mr-2" src={bitbucketIcon} alt="bitbucket icon"/>
      Bitbucket
    </button>
    <button className="my-button" disabled>
      <img className="mr-2" src={googleIcon} alt="google icon"/>
      Google
    </button>
    <button className="my-button" disabled>
      <img className="mr-2" src={facebookIcon} alt="facebook icon"/>
      Facebook</button>
  </div>
</div>
export default SocialButtons
