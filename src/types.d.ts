declare module 'passport-oauth2-alt' {
  type urlLookup = string | ((req: any, options: any) => string);

  export class Strategy {
    constructor(
      options: {
        authorizationURL: urlLookup;
        tokenURL: urlLookup;
        callbackURL: string;
        clientID: string;
        clientSecret: string;
        passReqToCallback?: boolean;
      },
      verify: (...args: any) => any,
    ): this;

    authenticate(...args: any[]): any;
  }
}
