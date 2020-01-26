const GoogleStrategy = require('passport-google-oauth20').Strategy;

const AuthorizationModel = require('./models/AuthorizedUsers');

const port = process.env.NODE_ENV === 'production' ? '' : `:${process.env.PORT}`;
const callback_url = `${process.env.DOMAIN}${port}/auth/google/callback`;

const googleSettings = {
  clientID: process.env.GOOGLE_CLIENT_ID,
  clientSecret: process.env.GOOGLE_CLIENT_SECRET,
  callbackURL:  callback_url
};

module.exports = function(passport, redis) {
  const Authorization = AuthorizationModel(redis);

  passport.serializeUser(function(username, done) {
    done(null, username);
  });

  passport.deserializeUser(function(username, done) {
    done(null, username);
  });

  passport.use(new GoogleStrategy(
    googleSettings,
    function(accessToken, refreshToken, profile, cb) {
      // TODO: Perhaps this could be more robust.
      const email = profile.emails[0] && profile.emails[0].value;
      profile.email = email;

      Authorization.isAuthorized(email, (err, resp) => {
        if (err || resp !== 1) {
          cb(err, null);
        } else {
          cb(null, profile);
        }
      });
    }
  ));
};
