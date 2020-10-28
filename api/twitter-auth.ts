import {NowRequest, NowResponse} from '@vercel/node';
import {OAuth} from 'oauth';
import cookie from 'cookie';

type OauthData = {
  token: string;
  secret: string;
};

/**
 * Authorizes a twitter app for prolink tools twitter integration
 */
export default async (request: NowRequest, response: NowResponse) => {
  var oauth = new OAuth(
    'https://api.twitter.com/oauth/request_token',
    'https://api.twitter.com/oauth/access_token',
    process.env['TWITTER_API_KEY'] ?? '',
    process.env['TWITTER_API_SECRET'] ?? '',
    '1.0A',
    null,
    'HMAC-SHA1'
  );

  // Initiate oauth request
  if (request.query['oauth_verifier'] === undefined) {
    const oauthRequest = await new Promise<OauthData>(resolve =>
      oauth.getOAuthRequestToken((_, token, secret) => resolve({token, secret}))
    );

    response.setHeader('Set-Cookie', [
      cookie.serialize('twitter_oauth', JSON.stringify(oauthRequest)),
    ]);

    response.redirect(
      `https://api.twitter.com/oauth/authorize?oauth_token=${oauthRequest.token}`
    );

    return;
  }

  const verifier = request.query['oauth_verifier'] as string;
  const oauthRequest: OauthData = JSON.parse(request.cookies['twitter_oauth']);

  const accessToken = await new Promise<OauthData>(resolve =>
    oauth.getOAuthAccessToken(
      oauthRequest.token,
      oauthRequest.secret,
      verifier,
      (_, token, secret) => resolve({token, secret})
    )
  );

  response.redirect(
    `prolinkTools://twitter-auth?token=${accessToken.token}&secret=${accessToken.secret}`
  );
};
