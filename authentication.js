var process = require('process')
var LocalStrategy = require('passport-local').Strategy;
var GoogleStrategy = require('passport-google-oauth20').Strategy;


module.exports = function(passport, adminUsername, adminPassword) {

  passport.serializeUser(function(username, done) {
    done(null, username);
  });

  passport.deserializeUser(function(username, done) {
    done(null, username);
  });

  passport.use(new LocalStrategy({
      usernameField: 'username',
      passwordField: 'password',
    }, function(username, password, done) {
      if (adminUsername == username && adminPassword == password)
        done(null, username);
      else 
        done(null, false, { message: "Incorrect Username or Password"} );
    }
  ));

  passport.use(new GoogleStrategy({
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: "http://localhost:3000/auth/google/callback",
      passReqToCallback: true
    },
    function(req, accessToken, refreshToken, profile, cb) {
        console.log('CALLBACK CALLED');
        console.log(req);
        console.log('Google Strategy callback');
        console.log(profile);
        cb(null, profile);
    }
  ));
};
