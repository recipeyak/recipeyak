import React from "react"

import {
  GITHUB_OAUTH_URL,
  GITLAB_OAUTH_URL,
  BITBUCKET_OAUTH_URL,
  GOOGLE_OAUTH_URL,
  FACEBOOK_OAUTH_URL
} from "@/settings"

import { FormErrorHandler } from "@/components/Forms"

// tslint:disable:no-var-requires
const githubIcon = require("@/static/images/oauth/github-logo.svg")
const githubIconWhite = require("@/static/images/oauth/github-logo-white.svg")
const gitlabIcon = require("@/static/images/oauth/gitlab-logo.svg")
const gitlabIconWhite = require("@/static/images/oauth/gitlab-logo-white.svg")
const googleIcon = require("@/static/images/oauth/google-logo.svg")
const bitbucketIcon = require("@/static/images/oauth/bitbucket-logo.svg")
const facebookIcon = require("@/static/images/oauth/facebook-logo.svg")
// tslint:enable:no-var-requires

interface IImgProps {
  readonly src: string
  readonly alt: string
}
const Img = ({ src, alt }: IImgProps) => (
  <img className="mr-2" width="25px" height="25px" src={src} alt={alt} />
)

// tslint:disable-next-line:no-unsafe-any
export const GithubImg = () => <Img src={githubIcon} alt="github icon" />
// tslint:disable-next-line:no-unsafe-any
export const GitlabImg = () => <Img src={gitlabIcon} alt="gitlab icon" />
// tslint:disable-next-line:no-unsafe-any
export const GoogleImg = () => <Img src={googleIcon} alt="google icon" />
export const BitbucketImg = () => (
  // tslint:disable-next-line:no-unsafe-any
  <Img src={bitbucketIcon} alt="bitbucket icon" />
)
// tslint:disable-next-line:no-unsafe-any
export const FacebookImg = () => <Img src={facebookIcon} alt="facebook icon" />

export const Github = ({ disable = false }) => {
  if (!GITHUB_OAUTH_URL) {
    return null
  }
  return (
    <a href={!disable ? GITHUB_OAUTH_URL : ""} className="github-button">
      {/* tslint:disable-next-line:no-unsafe-any */}
      <img className="mr-2" src={githubIconWhite} alt="github icon" />
    </a>
  )
}

export const Gitlab = () => {
  if (!GITLAB_OAUTH_URL) {
    return null
  }
  return (
    <a href={GITLAB_OAUTH_URL} className="gitlab-button">
      {/* tslint:disable-next-line:no-unsafe-any */}
      <img className="mr-2" src={gitlabIconWhite} alt="gitlab icon" />
    </a>
  )
}

export const Bitbucket = () => {
  if (!BITBUCKET_OAUTH_URL) {
    return null
  }
  return (
    <a href={BITBUCKET_OAUTH_URL} className="my-button">
      {/* tslint:disable-next-line:no-unsafe-any */}
      <img className="mr-2" src={bitbucketIcon} alt="bitbucket icon" />
      Bitbucket
    </a>
  )
}

export const Google = () => {
  if (!GOOGLE_OAUTH_URL) {
    return null
  }
  return (
    <a href={GOOGLE_OAUTH_URL} className="google-button">
      {/* tslint:disable-next-line:no-unsafe-any */}
      <img className="mr-2" src={googleIcon} alt="google icon" />
    </a>
  )
}
export const Facebook = () => {
  if (!FACEBOOK_OAUTH_URL) {
    return null
  }

  return (
    <a href={FACEBOOK_OAUTH_URL} className="my-button">
      {/* tslint:disable-next-line:no-unsafe-any */}
      <img className="mr-2" src={facebookIcon} alt="facebook icon" />
      Facebook
    </a>
  )
}

const enableSocialButtons =
  GITHUB_OAUTH_URL ||
  GITLAB_OAUTH_URL ||
  BITBUCKET_OAUTH_URL ||
  GOOGLE_OAUTH_URL ||
  FACEBOOK_OAUTH_URL

interface ISocialButtonsProps {
  readonly nonFieldErrors?: string[] | null
  readonly emailError?: string[] | null
  readonly signup?: boolean
}

const SocialButtons = ({
  nonFieldErrors,
  emailError,
  signup = true
}: ISocialButtonsProps) => {
  if (!enableSocialButtons) {
    return null
  }
  return (
    <>
      {signup && (
        <div className="d-flex align-items-center mb-2 mt-1">
          <span className="or-bar" /> or <span className="or-bar" />
        </div>
      )}
      <div className="d-grid grid-template-column-2-1fr grid-gap-3">
        <Github />
        <Gitlab />
        <Bitbucket />
        <Google />
        <Facebook />
      </div>
      <FormErrorHandler error={nonFieldErrors} />
      <FormErrorHandler error={emailError} />
    </>
  )
}

export default SocialButtons
