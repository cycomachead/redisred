var GoogleStrategy = require('passport-google-oauth20').Strategy;

const AuthorizationModel = require('./models/AuthorizedUsers');

module.exports = function(passport, redis) {
  console.log('loading auth  ', redis);
  const Authorization = AuthorizationModel(redis);
console.log( 'Auth model..', AuthorizationModel);

  passport.serializeUser(function(username, done) {
    done(null, username);
  });

  passport.deserializeUser(function(username, done) {
    done(null, username);
  });

  passport.use(new GoogleStrategy({
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: "http://localhost:3000/auth/google/callback",
      passReqToCallback: true
    },
    function(req, accessToken, refreshToken, profile, cb) {
        // TODO: Perhaps this could be more robust.
        const email = profile.emails[0] && profile.emails[0].value;
        Authorization.isAuthorized(email, (err, resp) => {
            console.log('AUTH CALLBACK   ', resp);
            cb(null, profile);
        });
    }
  ));
};
