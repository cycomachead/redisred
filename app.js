// Load the dotfiles.
require('dotenv').load();

// TODO: Clean this up.
var APP_CONFIG = {
    googleAnalyticsId: process.env.GOOGLE_ANALYTICS_ID,
    passportStrategies: {
        local: {
            
        },
        google: {
            
        }
    }
};
var port = process.env.PORT || 3000;
var redisUrl = process.env.REDIS_URL || 'redis://127.0.0.1:6379/0';
var sessionSecret = process.env.SESSION_SECRET || 'this is really secure';
var adminUsername = process.env.ADMIN_USERNAME || 'admin';
var adminPassword = process.env.ADMIN_PASSWORD || '123456';
var rootRedirect = process.env.ROOT_REDIRECT || `/admin`;
var apiToken = process.env.API_TOKEN || '1234567890abcdefghijklmnopqrstuvwxyz';


// Includes
var express = require('express');
var expressSession = require('express-session');
var cookieParser = require('cookie-parser');
var Redis = require('ioredis');
var passport = require('passport');
var favicon = require('serve-favicon');
var RedisStore = require('connect-redis')(expressSession);

var authentication = require('./authentication');
// REFACTOR: Make the above require passport and return the instance.
// var passport = authentication(APP_CONFIG);

// Initialize auth
authentication(passport, adminUsername, adminPassword);

var redis = new Redis(redisUrl);

//Initialize the app
var app = express();
var redisSessionStore = new RedisStore({client: redis});

app.set('views', './views');
app.set('view engine', 'jade');

app.use(express.static('./public/'));
app.use(favicon('./public/assets/favicon.png'));
app.use(cookieParser());
app.use(expressSession({
    store: redisSessionStore,
    secret: sessionSecret,
    resave: true,
    saveUninitialized: true
}));
app.use(passport.initialize());
app.use(passport.session());

// Initialize controllers
var frontendController = require('./controllers/admin/FrontendController')(redis, passport);
var apiController = require('./controllers/admin/APIController')(redis, apiToken);
var redirectController = require('./controllers/RedirectController')(redis);

// Initialize routes
var admin = require('./routes/admin.js')(frontendController, apiController);
var main = require('./routes/main.js')(rootRedirect, redirectController);

// send a basic page view before anything else executes
// This tracks both short codes and admin pages.
if (APP_CONFIG.googleAnalyticsId) {
    var ua = require('universal-analytics');
    app.use(ua.middleware(APP_CONFIG.googleAnalyticsId, { 
        cookieName: '_ga'
    }));
    app.use(function (req, res, next) {
        if (req.visitor) {
            req.visitor.pageview(req.url).send();
        }
        
        next();
    });
}

// Middleware for Jade Views
app.use(function(req, res, next) {
  if (!res.locals) {
    res.locals = {};
  }
  res.locals.options = {
    APP_NAME : process.env.APP_NAME || 'redisred',
    ROOT_REDIRECT: rootRedirect
  };
  
  next();
});

app.use('/admin', admin);
app.use('/', main);

app.use(function(req, res, next) {
  res.status(404).render('error', {
      statusCode: 404,
      errorMessage: 'Uh oh! It looks like that page can\'t be found. :('
  });
});

// Start the server
console.log('Connecting to redis...');
redis.ping(function (err) {
  if (!err) {
    console.log('Connection successful. Server listening on port ' + port);
    app.listen(port);
  }
});

