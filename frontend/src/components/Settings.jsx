import React from "react";
import PropTypes from "prop-types";
import { Helmet } from "./Helmet";
import { Link } from "react-router-dom";

import Loader from "./Loader";
import { ButtonPrimary, Button, ButtonDanger } from "./Buttons";

import { GithubImg, GitlabImg } from "./SocialButtons";

import { GITHUB_OAUTH_URL, GITLAB_OAUTH_URL } from "../settings";

const OAuthButton = ({
  name,
  Logo,
  error,
  connected,
  OAUTH_URL,
  disconnect,
  disconnecting
}) => (
  <div className="mb-2">
    <div className="d-flex">
      <div className="d-flex align-items-center w-200px">
        <Logo />
        {name}
      </div>
      <div className="d-flex align-center">
        {connected ? (
          <div className="d-flex align-center flex-wrap">
            <span className="has-text-success bold">Connected</span>
            <ButtonDanger
              onClick={disconnect}
              loading={disconnecting}
              className="ml-2"
            >
              Disconnect
            </ButtonDanger>
          </div>
        ) : (
          <a href={OAUTH_URL + "/connect"} className="my-button">
            Connect
          </a>
        )}
      </div>
    </div>
    {error && (
      <p className="help is-danger">
        <b>Error: </b>
        {error}
      </p>
    )}
  </div>
);

export default class SettingsWithState extends React.Component {
  static propTypes = {
    fetchData: PropTypes.func.isRequired,
    disconnectAccount: PropTypes.func.isRequired,
    deleteUserAccount: PropTypes.func.isRequired,
    email: PropTypes.string.isRequired,
    updateEmail: PropTypes.func.isRequired,
    avatarURL: PropTypes.string.isRequired,
    updatingEmail: PropTypes.bool.isRequired,
    socialAccountConnections: PropTypes.object.isRequired,
    loading: PropTypes.bool.isRequired,
    hasPassword: PropTypes.bool.isRequired
  };

  static defaultProps = {
    email: "",
    avatarURL: "",
    updatingEmail: false,
    socialAccountConnections: {},
    hasPassword: false
  };

  state = {
    email: this.props.email,
    loadingGithub: false,
    errorGithub: "",
    loadingGitlab: false,
    errorGitlab: false,
    errorGeneral: "",
    editing: false
  };

  componentWillReceiveProps = nextProps => {
    this.setState({ email: nextProps.email });
  };

  componentWillMount = () => {
    this.props.fetchData();
  };

  handleInputChange = e => {
    this.setState({ [e.target.name]: e.target.value });
  };

  disconnectAccount = (provider, id) => {
    if (provider === "github") {
      this.setState({ loadingGithub: true, errorGithub: "" });
    } else if (provider === "gitlab") {
      this.setState({ loadingGitlab: true, errorGitlab: "" });
    }
    this.setState({ errorGeneral: "" });
    this.props
      .disconnectAccount(provider, id)
      .then(() => {
        this.setState({ loadingGithub: false, loadingGitlab: false });
      })
      .catch(error => {
        if (
          error.response &&
          error.response.status === 403 &&
          error.response.data &&
          error.response.data.detail
        ) {
          if (provider === "github") {
            this.setState({ errorGithub: error.response.data.detail });
          } else if (provider === "gitlab") {
            this.setState({ errorGitlab: error.response.data.detail });
          }
        } else {
          this.setState({ errorGeneral: "Problem with action" });
        }
        this.setState({ loadingGithub: false, loadingGitlab: false });
      });
  };

  cancelEdit = () => this.setState({ editing: false });

  edit = () => this.setState({ editing: true });

  deleteAccountPrompt = () => {
    const response = prompt(
      "Are you sure you want to permanently delete your account? \nPlease type, 'delete my account', to irrevocably delete your account"
    );
    if (response.toLowerCase() === "delete my account") {
      this.props.deleteUserAccount();
    }
  };

  render() {
    const {
      email,
      editing,
      loadingGithub,
      loadingGitlab,
      errorGithub,
      errorGitlab
    } = this.state;
    const { handleInputChange, disconnectAccount } = this;

    const {
      updateEmail,
      avatarURL,
      updatingEmail,
      socialAccountConnections,
      loading,
      hasPassword
    } = this.props;

    const emailUnchanged = email === this.props.email;

    if (loading) {
      return (
        <section className="d-flex justify-content-center">
          <Loader />
        </section>
      );
    }

    const Github = () => (
      <OAuthButton
        name="Github"
        Logo={GithubImg}
        error={errorGithub}
        connected={socialAccountConnections.github != null}
        OAUTH_URL={GITHUB_OAUTH_URL}
        disconnect={() =>
          disconnectAccount("github", socialAccountConnections.github)
        }
        disconnecting={loadingGithub}
      />
    );

    const Gitlab = () => (
      <OAuthButton
        name="Gitlab"
        Logo={GitlabImg}
        error={errorGitlab}
        connected={socialAccountConnections.gitlab != null}
        OAUTH_URL={GITLAB_OAUTH_URL}
        disconnect={() =>
          disconnectAccount("gitlab", socialAccountConnections.gitlab)
        }
        disconnecting={loadingGitlab}
      />
    );

    return (
      <section>
        <Helmet title="Settings" />

        <h1 className="fs-8">User settings</h1>

        <div className="d-flex">
          <a
            href="https://secure.gravatar.com"
            className="justify-self-center mr-3"
          >
            <img
              width="128px"
              height="128px"
              alt="user profile"
              src={avatarURL + "&s=128"}
            />
          </a>

          <div className="align-self-center d-flex flex-direction-column">
            <form
              className="d-flex align-center"
              onSubmit={e => {
                e.preventDefault();
                if (emailUnchanged) {
                  return;
                }
                updateEmail();
              }}
            >
              <label className="better-label">Email</label>
              {editing ? (
                <input
                  onKeyDown={e => {
                    if (e.key === "Escape") {
                      this.cancelEdit();
                    }
                  }}
                  autoFocus
                  defaultValue={email}
                  onChange={handleInputChange}
                  type="text"
                  className="my-input"
                  name="email"
                />
              ) : (
                <span>{email}</span>
              )}
              {editing ? (
                <div className="d-flex">
                  <ButtonPrimary
                    className="ml-2"
                    name="email"
                    type="submit"
                    loading={updatingEmail}
                    disabled={emailUnchanged}
                    value="save email"
                  >
                    Save
                  </ButtonPrimary>
                  <Button
                    className="ml-2"
                    loading={updatingEmail}
                    name="email"
                    onClick={this.cancelEdit}
                    value="save email"
                  >
                    Cancel
                  </Button>
                </div>
              ) : (
                <a
                  className={
                    "ml-2 has-text-primary" +
                    (updatingEmail ? " is-loading" : "")
                  }
                  name="email"
                  onClick={this.edit}
                  value="edit"
                >
                  Edit
                </a>
              )}
            </form>

            <div className="d-flex justify-space-between">
              <label className="better-label">Password</label>
              {hasPassword ? (
                <Link to="/password" className="has-text-primary">
                  Change Password
                </Link>
              ) : (
                <Link to="/password/set" className="has-text-primary">
                  Set Password
                </Link>
              )}
            </div>
          </div>
        </div>

        <h1 className="fs-6">Social Accounts</h1>

        <Github />
        <Gitlab />

        <h1 className="fs-6">Danger Zone</h1>
        <a onClick={this.deleteAccountPrompt} className="has-text-danger">
          permanently delete my account
        </a>

        <h1 className="fs-6">Export</h1>
        <p>
          <a href="/recipes.yaml">recipes.yaml</a>
        </p>
        <p>
          <a href="/recipes.json">recipes.json</a>
        </p>
      </section>
    );
  }
}
