import {Redirect, useLocation} from 'react-router-dom';

const OAuthCallback = () => {
  const {search} = useLocation();
  const params = new URLSearchParams(search);
  const state = params.get('state');

  if (state === null) {
    return <Redirect to="/" />;
  }

  // We register state as the appId
  return <Redirect to={`/app/${state}/oauth/authorize${search}`} />;
};

export default OAuthCallback;
