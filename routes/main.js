/*
  This handles the basic redirection of short URLs.
      * Empty paths go to ROOT_REDIRECT
      * 404's are handled by the main app router.
*/
var express = require('express');

module.exports = function(rootRedirect, redirectController) {
    var router = express.Router();
    // Handle the homepage
    router.get('/', function(req, res) {
        res.redirect(rootRedirect);
    });
    // Handle Short URLs
    router.get('/:redirect_name', redirectController.redirect);
    return router;
};
