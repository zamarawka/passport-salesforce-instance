[![Ci Status](https://github.com/zamarawka/passport-salesforce-instance/workflows/CI/badge.svg)](https://github.com/zamarawka/passport-salesforce-instance/actions)
[![Npm version](https://img.shields.io/npm/v/passport-salesforce-instance.svg?style=flat&logo=npm)](https://www.npmjs.com/package/passport-salesforce-instance)

# passport-salesforce-instance

Salesforce instance authentication strategy for Passport with passing req and variable host.
Main goal of this package is login to concrete salesforce instance. It could be sandbox, dev org, custom domain org, etc.

Package includes its TypeScript Definitions

# Install

```sh
npm install passport-salesforce-instance
```

# Usage

```ts
// auth.ts
import passport from 'passport';
import { Strategy as SalesforceStrategy } from 'passport-salesforce-instance';

// Add Strategy
passport.use(
  new SalesforceStrategy(
    {
      host: (_req, options) =>
        options.host ??
        // fallback in case no instance founded
        (isSandbox ? 'https://test.salesforce.com' : 'https://login.salesforce.com'),
      clientID: 'your-sf-clientId',
      clientSecret: 'your-sf-clientSecret',
      callbackURL: 'your-cbUrl',
    },
    async (accessToken, refreshToken, profile, cb) => {
      try {
        // Find user
        let user = await User.find({
          sf_id: profile.user_id,
          sf_org_id: profile.organization_id,
        });

        if (user) {
          // Update user
          user.sf_token_access_token = accessToken;
          user.sf_token_refresh_token = refreshToken;
          user.name = profile.name;
          user.email = profile.email;
          user.nickname = profile.nickname;
        } else {
          // Create user
          user = new User({
            sf_token_access_token: accessToken,
            sf_token_refresh_token: refreshToken,
            name: profile.name,
            email: profile.email,
            sf_id: profile.user_id,
            sf_org_id: profile.organization_id,
          });
        }

        await user.save();

        return cb(null, user);
      } catch (e) {
        return cb(e, null);
      }
    },
  ),
);

// Way to look up host before request auth
export const withSfAuth = async (request, response, next) => {
  // Find salesforce instance host before auth
  const host = await someWayToLookupSfInstanceHost(request);

  // Create state of request passed in auth endpoint
  const state = {
    some: 'foo',
  };

  return passport.authenticate('salesforce', {
    host,
    session: false,
    state: JSON.stringify(state),
  })(request, response, next);
};
```

```ts
// app.ts
import { withSfAuth } from './auth.ts';

app.get('/users/join/sf', withSfAuth, (req, res, next) => {
  res.send(req.user.name);
});
```

## Strategy params

| Name             | Required | Default                             | Description                                                                                                                                  |
| ---------------- | -------- | ----------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------- |
| host             | true     | `undefined`                         | String of Function typed as `(req: Express.Reqest, options: AuthorizeOptions) => string`, which contains host of Salesforce instance         |
| clientID         | true     | `undefined`                         | String with clientID of Salesforce app                                                                                                       |
| clientSecret     | true     | `undefined`                         | String with clientSecret of Salesforce app                                                                                                   |
| callbackURL      | true     | `undefined`                         | String with callback url of your app to handle Salesforce response. For usage example it will be `<app host>/users/join/sf`                  |
| authorizationURL | false    | `${host}/services/oauth2/authorize` | Url of Salesforce OAuth2 authorize page                                                                                                      |
| tokenURL         | false    | `${host}/services/oauth2/token`     | Url of Salesforce OAuth2 token [api endpoint](https://help.salesforce.com/s/articleView?id=sf.remoteaccess_oauth_web_server_flow.htm&type=5) |
| isForceLogin     | false    | `false`                             | View login form into authorize action. It will prevent automatic authorize of logged in users                                                |

# Development

```sh
npm run format # code fomatting
npm run lint # linting
npm run build # build
npm run test # testing
```

Active maintenance with care and ??????.

Feel free to send a PR.
