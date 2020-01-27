// Load the dotfiles.
require('dotenv').load();
const path = require('path');

// TODO: Clean this up.
var APP_CONFIG = {
  googleAnalyticsId: process.env.GOOGLE_ANALYTICS_ID,
  adminEmail: process.env.ADMIN_EMAIL
};

var port = process.env.PORT || 3000;
var redisUrl = process.env.REDIS_URL || 'redis://127.0.0.1:6379/0';
var sessionSecret = process.env.SESSION_SECRET || 'this is really secure';
var rootRedirect = process.env.ROOT_REDIRECT || `/admin`;
var apiToken = process.env.API_TOKEN || '1234567890abcdefghijklmnopqrstuvwxyz';
const SENTRY_DSN = process.env.SENTRY_DSN || '';

const Sentry = require('@sentry/node');

Sentry.init({
  dsn: SENTRY_DSN,
});

var express = require('express');
var session = require('express-session');
var cookieParser = require('cookie-parser');
var Redis = require('ioredis');
var passport = require('passport');
var favicon = require('serve-favicon');
var RedisStore = require('connect-redis')(session);

var app = express();
var redis = Redis(redisUrl);

var redisSessionStore = new RedisStore({
  client: redis
});

// The request handler must be the first middleware on the app
app.use(Sentry.Handlers.requestHandler());

app.set('views', './views');
app.set('view engine', 'pug');

app.use("/bootstrap",
  express.static(path.join(__dirname, '/node_modules/bootstrap/dist/'))
);
app.use("/chartjs",
  express.static(path.join(__dirname, '/node_modules/chart.js/dist/'))
);
app.use("/chartkick",
  express.static(path.join(__dirname, '/node_modules/chartkick/dist/'))
);
app.use("/jquery",
  express.static(path.join(__dirname, '/node_modules/jquery/dist/'))
);
app.use("/ujs",
  express.static(path.join(__dirname, '/node_modules/jquery-ujs/src/'))
);
app.use(express.static('./public/'));
app.use(favicon('./public/assets/favicon.png'));
app.use(cookieParser());
app.use(session({
  store: redisSessionStore,
  secret: sessionSecret,
  resave: true,
  saveUninitialized: false
}));
app.use(passport.initialize());
app.use(passport.session());

// Initialize controllers
var frontendController = require('./controllers/admin/FrontendController')(
  redis, passport
);
var apiController = require('./controllers/admin/APIController')(
  redis, apiToken
);
var redirectController = require('./controllers/RedirectController')(redis);
var authentication = require('./authentication')(passport, redis);


// Initialize routes
const admin = require('./routes/admin.js')(frontendController, apiController);
const auth = require('./routes/auth.js')(passport);
const main = require('./routes/main.js')(rootRedirect, redirectController);

// send a basic page view before anything else executes
// This tracks both short codes and admin pages.
if (APP_CONFIG.googleAnalyticsId) {
  var ua = require('universal-analytics');
  app.use(ua.middleware(APP_CONFIG.googleAnalyticsId, {
    cookieName: '_ga'
  }));
  app.use(function(req, res, next) {
    if (req.visitor) {
      req.visitor.pageview(req.url).send();
    }

    next();
  });
}


// Middleware for Pug Views
app.use(function(req, res, next) {
  if (!res.locals) {
    res.locals = {};
  }
  res.locals.options = {
    APP_NAME: process.env.APP_NAME || 'redisred',
    ROOT_REDIRECT: rootRedirect
  };

  next();
});


app.use('/admin', admin);
app.use('/auth', auth);
app.use('/', main);

// The error handler must be before any other error middleware and after all controllers
app.use(Sentry.Handlers.errorHandler());

app.use(function(req, res, next) {
  res.status(404).render('error', {
    statusCode: 404,
    errorMessage: 'Uh oh! It looks like that page can\'t be found. :('
  });
});

// Start the server
console.log('Connecting to redis...');
redis.ping(function (err) {
  if (err) {
    console.error(err);
    process.exit(1);
  }

  console.log('Connection successful. Server listening on port ' + port);
  app.listen(port);
});
