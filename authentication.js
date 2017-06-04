const GoogleStrategy = require('passport-google-oauth20').Strategy;

const AuthorizationModel = require('./models/AuthorizedUsers');

const googleSettings = new GoogleStrategy({
  clientID: process.env.GOOGLE_CLIENT_ID,
  clientSecret: process.env.GOOGLE_CLIENT_SECRET,
  callbackURL: `${process.env.DOMAIN}:${process.env.PORT}/auth/google/callback`
});

module.exports = function(passport, redis) {
  const Authorization = AuthorizationModel(redis);
  passport.serializeUser(function(username, done) {
    done(null, username);
  });

  passport.deserializeUser(function(username, done) {
    done(null, username);
  });

  passport.use(
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
