import {NowRequest, NowResponse} from '@vercel/node';
import {OAuth, oauth1tokenCallback} from 'oauth';

export default async (request: NowRequest, response: NowResponse) => {
  var oauth = new OAuth(
    'https://api.twitter.com/oauth/request_token',
    'https://api.twitter.com/oauth/access_token',
    process.env['TWITTER_API_KEY'],
    process.env['TWITTER_API_SECRET'],
    '1.0A',
    null,
    'HMAC-SHA1'
  );

  const test = await new Promise<Parameters<oauth1tokenCallback>>(resolve =>
    oauth.getOAuthRequestToken((...data) => resolve(data))
  );

  response.status(200).json(test);
};
