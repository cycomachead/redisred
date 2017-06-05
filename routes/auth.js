const express = require('express');

module.exports = (passport) => {
  const AuthRouter = express.Router();
  AuthRouter.get(
    '/google',
    passport.authenticate('google', {
      scope: ['profile', 'email']
    })
  );

  AuthRouter.get(
    '/google/callback',
    passport.authenticate(
      'google',
      { successRedirect: '/admin/root', failureRedirect: '/admin' }
    )
  );
  
  return AuthRouter;
}