import * as chai from 'chai';
import { expect } from 'chai';

import { Strategy } from '../src';

const noop = () => {};

describe('Strategy', () => {
  const chaiPassport = (chai as any).passport;

  const baseOpts = {
    host: (_req: any, options: { host?: string }) => options.host ?? 'https://login.salesforce.com',
    clientID: 'your-sf-clientId',
    clientSecret: 'your-sf-clientSecret',
    callbackURL: 'http://your-cbUrl.com',
  };

  describe('constructed', function () {
    const strategy = new Strategy(
      {
        ...baseOpts,
      },
      noop,
    );

    it('should be named salesforce', function () {
      expect(strategy.name).to.equal('salesforce');
    });
  });

  describe('authorization request', function () {
    const strategy = new Strategy(
      {
        ...baseOpts,
      },
      noop,
    );

    let url: string;

    before(function (done: () => void) {
      chaiPassport
        .use(strategy)
        .request(function (req: any) {
          req.connection = req.connection ?? {};
          req.connection.encrypted = false;
        })
        .redirect(function (u: string) {
          url = u;
          done();
        })
        .authenticate({ session: false });
    });

    it('should be redirected', function () {
      expect(url).to.equal(
        'https://login.salesforce.com/services/oauth2/authorize?response_type=code&redirect_uri=http%3A%2F%2Fyour-cbUrl.com&client_id=your-sf-clientId',
      );
    });
  });

  describe('authorization request with force login prompt', function () {
    const strategy = new Strategy(
      {
        ...baseOpts,
        isForceLogin: true,
      },
      noop,
    );

    let url: string;

    before(function (done: () => void) {
      chaiPassport
        .use(strategy)
        .request(function (req: any) {
          req.connection = req.connection ?? {};
          req.connection.encrypted = false;
        })
        .redirect(function (u: string) {
          url = u;
          done();
        })
        .authenticate({ session: false });
    });

    it('should be redirected', function () {
      expect(url).to.equal(
        'https://login.salesforce.com/services/oauth2/authorize?prompt=login&response_type=code&redirect_uri=http%3A%2F%2Fyour-cbUrl.com&client_id=your-sf-clientId',
      );
    });
  });

  describe('authorization request with any other host', function () {
    const strategy = new Strategy(
      {
        ...baseOpts,
      },
      noop,
    );

    let url: string;

    before(function (done: () => void) {
      chaiPassport
        .use(strategy)
        .request(function (req: any) {
          req.connection = req.connection ?? {};
          req.connection.encrypted = false;
        })
        .redirect(function (u: string) {
          url = u;
          done();
        })
        .authenticate({ session: false, host: 'https://some-other-sf-host.com' });
    });

    it('should be redirected', function () {
      expect(url).to.equal(
        'https://some-other-sf-host.com/services/oauth2/authorize?response_type=code&redirect_uri=http%3A%2F%2Fyour-cbUrl.com&client_id=your-sf-clientId',
      );
    });
  });
});
