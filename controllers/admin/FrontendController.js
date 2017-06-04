var _ = require('lodash');
var moment = require('moment');

var redirectModel = require('../../models/Redirect');
var authModel = require('../../models/AuthorizedUsers');

module.exports = function(redis) {
  const Redirect = redirectModel(redis);
  const Authorization = authModel(redis);
  const FrontendController = {};

  // Authentication stuff...
  FrontendController.authenticate = function(req, res, next) {
    if (req.isAuthenticated()) {
      return next();
    } else {
      res.redirect('/admin');
    }
  };

  FrontendController.showLogin = function(req, res) {
    if (req.isAuthenticated()) {
      res.redirect('/admin/redirects');
    } else {
      res.render('admin/root');
    }
  };

  FrontendController.logout = function(req, res) {
    req.session = null;
    res.redirect('/admin');
  };

  // Redirect Logic
  FrontendController.getAllRedirects = function(req, res) {
    Redirect.getAll(function(err, redirects) {
      if (err) {
        res.status(500).render('error', {
          statusCode: 500,
          errorMessage: err
        });
      } else {
        // The default sort case is reverse chronological order
        // So we swap the before and after values.
        var sort_key = req.query.sort || 'created_at',
          directon = 'down' || req.query.directon,
          before = directon === 'down' ? -1 : 1,
          after = directon === 'down' ? 1 : -1;

        redirects.sort(function(a, b) {
          return a[sort_key] === b[sort_key] ? 0 : a[sort_key] < b[sort_key] ? before : after;
        });

        res.status(200).render('admin/redirects', {
          redirects: redirects,
          token: req.csrfToken()
        });
      }
    });
  };

  FrontendController.viewRedirect = function(req, res) {
    const key = req.params.redirect;
    Redirect.get(key, function(err, redirect) {
      if (err) {
        res.status(500).render('error', {
          statusCode: 500,
          errorMessage: err
        });
      } else {
        res.status(200).render('admin/view', {
          key: key,
          url: redirect.url,
          created_at: moment(redirect.created_at).format('LLL'),
          created_by: redirect.created_by,
          count: redirect.clicks.length,
          visits: redirect.clicks.map((c) => new Date(+c)),
          token: req.csrfToken()
        });
      }
    });
  };
  
  // TODO: Expose a different group by function (weeks, hours, etc)
  FrontendController.visitLog = function(req, res) {
    const key = req.params.redirect;
    Redirect.get(key, function(err, redirect) {
      if (err) {
        res.status(500).render('error', {
          statusCode: 500,
          errorMessage: err
        });
      } else {
        result = redirect.clicks.map((c) => new Date(+c))
        result = _.countBy(result, d => moment(d).startOf('day').format());
        res.status(200).json(result);
      }
    });
  };
  
  FrontendController.createRedirect = function(req, res) {
    var key = req.body.key;
    var url = req.body.url;
    var email = req.user.email;
    if (!key || !url) {
      res.status(400).render('error', {
        statusCode: 400,
        errorMessage: "Cannot create redirect: a short code or URL is missing."
      });
      return;
    }
    Redirect.create(key, url, email, function(err, redirect) {
      if (err) {
        res.status(500).render('error', {
          statusCode: 500,
          errorMessage: err
        });
      } else {
        res.redirect('/admin/redirects');
      }
    });
  };

  FrontendController.deleteRedirect = function(req, res) {
    var key = req.body.key;
    if (!key) {
      res.status(400).render('error', {
        statusCode: 400,
        errorMessage: 'You failed to supply all of the parameters.'
      });
      return;
    }
    Redirect.delete(key, function(err) {
      if (err) {
        res.status(500).render('error', {
          statusCode: 500,
          errorMessage: err
        });
      } else {
        res.redirect('/admin/redirects');
      }
    });
  };

  // Users Logic
  FrontendController.getAllUsers = function(req, res) {
    Authorization.allAuthorizations(function(err, users) {
      if (err) {
        res.status(500).render('error', {
          statusCode: 500,
          errorMessage: err
        });
      } else {
        // The default sort case is reverse chronological order
        // So we swap the before and after values.
        var directon = 'down' || req.query.directon,
          before = directon === 'down' ? -1 : 1,
          after = directon === 'down' ? 1 : -1;

        users.sort(function(a, b) {
          if (a === b) {
            return 0;
          }
          return a < b ? before : after;
        });

        res.status(200).render('admin/users', {
          users: users,
          token: req.csrfToken()
        });
      }
    });
  };

  FrontendController.addAuthorization = function(req, res) {
    var email = req.body.email;
    if (!email) {
      res.status(400).render('error', {
        statusCode: 400,
        errorMessage: "Cannot create redirect: a short code or URL is missing."
      });
      return;
    }
    Authorization.create(email, function(err) {
      if (err) {
        res.status(500).render('error', {
          statusCode: 500,
          errorMessage: err
        });
      } else {
        res.redirect('/admin/users');
      }
    });
  };

  FrontendController.deleteAuthorization = function(req, res) {
    var email = req.body.email;
    if (!email) {
      res.status(400).render('error', {
        statusCode: 400,
        errorMessage: 'You failed to supply all of the parameters.'
      });
      return;
    }
    Authorization.delete(email, function(err) {
      if (err) {
        res.status(500).render('error', {
          statusCode: 500,
          errorMessage: err
        });
      } else {
        res.redirect('/admin/users');
      }
    });
  };

  Authorization.create(process.env.ADMIN_EMAIL, console.log);
  return FrontendController;
};
