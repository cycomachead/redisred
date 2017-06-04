/*
    Redirects -- Redis Model
    
    redirect:SHORT_URL => url
    created_at:SHORT_URL => timestamp
    created_by:SHORT_URL => email_address
    vists:SHORT_URL: [timestamps]
*/

const redirectPrefix = "redirect:";
const createdAtPrefix = 'created_at:';
const createdByPrefix = 'created_by:';
const visitsListPrefix = "visits:";

// Note that Redis returns string values for all items
// JS Date is expecting an integer.
function createResponseObject(key, url, clicks, created, email) {
  return {
    key: key,
    url: url,
    clicks: clicks,
    created_at: new Date(+created),
    created_by: email
  };
};

function protectedGet(x) {
  if (x.constructor == Array && x[0] == null && x.length > 1) {
    return x[1];
  }
  return x;
}

function redisResponseToObject(key, url, clicks, createdAt, email) {
  return createResponseObject(
    key,
    protectedGet(url),
    protectedGet(clicks),
    protectedGet(createdAt),
    protectedGet(email)
  );
};

function baseKey(key, prefix) {
  return key.substring(prefix.length);
};

module.exports = function(redis) {
  var Redirect = {};

  Redirect.visit = function(key, callback) {
    key = key.toLowerCase();
    redis.multi({
      pipeline: false
    });
    redis.get(redirectPrefix + key);
    redis.lpush(visitsListPrefix + key, (new Date()).valueOf());
    redis.exec(function(err, result) {
      if (err) {
        return callback(err);
      }
      callback(null, result[0] && result[0][1]);
    });
  };

  Redirect.get = function(key, callback) {
    key = key.toLowerCase();
    redis.multi({
      pipeline: false
    });
    redis.mget(
      redirectPrefix + key,
      createdAtPrefix + key,
      createdByPrefix + key
    );
    redis.lrange(visitsListPrefix + key, 0, -1);
    redis.exec(function(err, result) {
      if (err) {
        return callback(err);
      }
      // Returns [
      // [ null, [ 'http://twitter.com', '1496302478412', 'email' ] ],
      // [ null, [ '1496302970143', '1496302482715' ] ] 
      // ]
      callback(null, redisResponseToObject(
        key,
        result[0][1][0], // URL
        result[1][1], // clicks list
        result[0][1][1], // created_at
        result[0][1][2] // created_at
      ));
    });
  };

  Redirect.create = function(key, url, email, callback) {
    var createdAt = (new Date().valueOf());
    key = key.toLowerCase();
    redis.mset(
      redirectPrefix + key, url,
      createdAtPrefix + key, createdAt,
      createdByPrefix + key, email,
      function(err, result) {
        if (err) {
          return callback(err);
        }
        callback(null, createResponseObject(key, url, 0, createdAt), email);
      }
    );
  };

  Redirect.delete = function(key, callback) {
    key = key.toLowerCase();
    redis.del(
      redirectPrefix + key,
      visitsListPrefix + key,
      createdAtPrefix + key,
      createdByPrefix + key,
      function(err, result) {
        // TODO improve this...
        if (err) {
          callback(err);
          return;
        }
        callback(!!err);
      });
  };

  // TODO: Migrate this to using SCAN ?
  Redirect.getAll = function(callback) {
    redis.keys(redirectPrefix + "*", function(keysError, keys) {
      if (keysError) {
        return callback(keysError);
      }
      redis.multi({
        pipeline: false
      });
      keys.forEach(function(element) {
        var key = baseKey(element, redirectPrefix);
        redis.get(redirectPrefix + key);
        redis.llen(visitsListPrefix + key);
        redis.get(createdAtPrefix + key);
        redis.get(createdByPrefix + key);
      });
      redis.exec(function(err, results) {
        if (err) {
          return callback(err);
        }
        var resultArray = [];
        for (var i = 0; i < keys.length; i++) {
          var key = baseKey(keys[i], redirectPrefix);
          resultArray.push(
            redisResponseToObject(
              key,
              results[4 * i], // URL
              results[4 * i + 1], // Len
              results[4 * i + 2], // Created At
              results[4 * i + 3] // Created By
            )
          );
        }

        callback(null, resultArray);
      });
    });
  };

  return Redirect;
};
