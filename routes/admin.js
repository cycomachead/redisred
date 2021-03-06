var express = require('express');
var csrf = require('csurf');
var bodyParser = require('body-parser');

module.exports = function(frontend, api) {

  var apiRouter = express.Router();
  apiRouter.use(bodyParser.json());
  apiRouter.get('/', api.authenticate, api.getAllRedirects);
  apiRouter.post('/create', api.authenticate, api.createRedirect);
  // apiRouter.post('/update', api.authenticate, api.updateRedirect);
  apiRouter.post('/delete', api.authenticate, api.deleteRedirect);

  var csrfProtection = csrf({ cookie: true });
  var frontendRouter = express.Router();
  frontendRouter.use(bodyParser.urlencoded({ extended: false }));
  frontendRouter.get('/', frontend.showLogin);
  frontendRouter.get('/login', frontend.showLogin);
  frontendRouter.get('/logout', frontend.logout);

  frontendRouter.get(
      '/redirects',
      csrfProtection,
      frontend.authenticate,
      frontend.getAllRedirects
  );
  frontendRouter.get(
      '/new',
      csrfProtection,
      frontend.authenticate,
      frontend.newRedirect
  );
  frontendRouter.post(
      '/redirect/create',
      csrfProtection,
      frontend.authenticate,
      frontend.createRedirect
  );
  frontendRouter.post(
    '/redirect/update',
    csrfProtection,
    frontend.authenticate,
    frontend.updateRedirect
);
  frontendRouter.post(
      '/redirect/delete',
      csrfProtection,
      frontend.authenticate,
      frontend.deleteRedirect
  );

  frontendRouter.get(
      '/view/:redirect',
      csrfProtection,
      frontend.authenticate,
      frontend.viewRedirect
  );

  frontendRouter.get(
      '/view/:redirect/visits',
      csrfProtection,
      frontend.authenticate,
      frontend.visitLog
  );

  frontendRouter.get(
      '/users',
      csrfProtection,
      frontend.authenticate,
      frontend.getAllUsers
  );
  frontendRouter.post(
      '/authorization/create',
      csrfProtection,
      frontend.authenticate,
      frontend.addAuthorization
  );
  frontendRouter.post(
      '/authorization/delete',
      csrfProtection,
      frontend.authenticate,
      frontend.deleteAuthorization
  );

  var router = express.Router();
  router.use('/api', apiRouter);
  router.use('/', frontendRouter);
  router.get('*',function(req, res) {
    res.redirect('/admin');
  });

  return router;
};
