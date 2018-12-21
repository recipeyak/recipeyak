import { connect } from "react-redux";
import queryString from "query-string";

import { socialLogin as login } from "../store/actions.js";
import OAuth from "../components/OAuth.jsx";

const mapDispatchToProps = dispatch => {
  return {
    login: (...args) => dispatch(login(...args))
  };
};

const mapStateToProps = (state, props) => {
  const service = props.match.params.service;
  const parsed = queryString.parse(props.location.search);
  const token = parsed.token || parsed.code;
  const redirectUrl = state.auth.fromUrl;

  return {
    service,
    token,
    redirectUrl
  };
};

const ConnectedPasswordReset = connect(
  mapStateToProps,
  mapDispatchToProps
)(OAuth);

export default ConnectedPasswordReset;
