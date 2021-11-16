import { Strategy as OAuth2Strategy } from 'passport-oauth2-alt';

import UserProfile from './UserProfile';

type UrlLookupParam = string | ((req: any, options: any) => string);

type Options = {
  host: UrlLookupParam;
  authorizationURL?: UrlLookupParam;
  tokenURL?: UrlLookupParam;
  clientID: string;
  clientSecret: string;
  callbackURL: string;
};

type VerifyCb = (
  accessToken: string,
  refreshToken: string,
  profile: UserProfile,
  cb: (err: null | any, user: any) => any,
) => any;

type VerifyWithReqCb = (
  req: any,
  accessToken: string,
  refreshToken: string,
  profile: UserProfile,
  cb: (err: null | any, user: any) => any,
) => any;

export default class Strategy extends OAuth2Strategy {
  name: string;

  constructor(opts: Options & { passReqToCallback?: boolean }, verify: VerifyWithReqCb);
  constructor(opts: Options, verify: VerifyCb);
  constructor({ host, ...opts }: Options, verify: VerifyCb | VerifyWithReqCb) {
    if (!host) {
      throw new TypeError('SalesforceStrategy: host is required param');
    }

    const urlLookup =
      (url: string) =>
      (...args: [any, any]) => {
        const domain = typeof host === 'function' ? host(...args) : host;

        return `${domain}${url}`;
      };

    const options = {
      authorizationURL: urlLookup('/services/oauth2/authorize'),
      tokenURL: urlLookup('/services/oauth2/token'),
      ...opts,
    };

    super(options, verify);

    this.name = 'salesforce';
  }

  authenticate(...args: any[]) {
    return super.authenticate(...args);
  }

  userProfile(
    accessToken: string,
    done: (err?: any, res?: UserProfile) => void,
    tokenReqResults: { instance_url: string },
    _req: any,
    oauthInstance: any,
  ) {
    oauthInstance.get(
      `${tokenReqResults.instance_url}/services/oauth2/userinfo`,
      accessToken,
      (err?: any, body?: string) => {
        if (err) {
          return done(err);
        }

        try {
          const json = JSON.parse(body);
          json.provider = 'salesforce';
          json.providerInstance = tokenReqResults.instance_url;

          return done(null, json as UserProfile);
        } catch (e) {
          return done(e);
        }
      },
    );
  }
}
