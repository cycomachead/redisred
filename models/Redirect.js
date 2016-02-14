/*
    Redirects -- Redis Model
    
*/
var urlKeyPrefix = "url_";
var clicksKeyPrefix = "clicks_";
var dateAddedPrefix = 'dateCreated_';

// Note that Redis returns string values for all items
// JS Date is expecting an integer.
function createResponseObject(key, url, clicks, created) {
    return {
        key: key,
        url: url,
        clicks: clicks,
        createdAt: new Date(+created)
    };
};

function redisResponseToObject(key, url, clicks, createdAt) {
    var protectedGet = (x) => x !== undefined && x.length > 1 ? x[1] : null;
    var resultUrl = protectedGet(url);

    if (resultUrl) {
        return createResponseObject(
            key,
            resultUrl,
            protectedGet(clicks),
            protectedGet(createdAt)
        );
    } else {
        return false;
    }
};

function baseKey(key, prefix) {
    return key.substring(prefix.length);
};

module.exports = function(redis) {
    var Redirect = {};

    Redirect.get = function(key, callback) {
        key = key.toLowerCase();
        redis.multi({
            pipeline: false
        });
        redis.get(urlKeyPrefix + key);
        redis.llen(clicksKeyPrefix + key);
        redis.get(dateAddedPrefix + key);
        redis.lpush(clicksKeyPrefix + key, (new Date()).valueOf());
        redis.exec(function(err, result) {
            if (err) {
                return callback(err);
            }
            callback(false, redisResponseToObject(
                key,
                result[0],
                result[1],
                result[2]
            ));
        });
    };

    Redirect.create = function(key, url, callback) {
        var createdAt = (new Date().valueOf());
        key = key.toLowerCase();
        redis.multi({
            pipeline: false
        });
        redis.set(urlKeyPrefix + key, url);
        redis.set(dateAddedPrefix + key, createdAt)
        redis.exec(function(err, result) {
            if (err) {
                callback(err);
                return;
            }
            callback(false, createResponseObject(key, url, 0, createdAt));
        });
    };

    Redirect.delete = function(key, callback) {
        key = key.toLowerCase();
        redis.del(
            urlKeyPrefix + key,
            clicksKeyPrefix + key,
            dateAddedPrefix + key,
            function(err, result) {
                // TODO improve this...
                if (err) {
                    callback(err);
                    return;
                }
                callback( !! err);
            });
    };

    Redirect.getAll = function(callback) {
        redis.keys(urlKeyPrefix + "*", function(keysError, keys) {
            if (keysError) {
                return callback(keysError);
            }
            redis.multi({
                pipeline: false
            });
            keys.forEach(function(element) {
                var key = baseKey(element, urlKeyPrefix);
                redis.get(urlKeyPrefix + key);
                redis.llen(clicksKeyPrefix + key);
                redis.get(dateAddedPrefix + key);
            });
            redis.exec(function(err, results) {
                if (err) {
                    return callback(err);
                }
                var resultArray = [];
                for (var i = 0; i < keys.length; i++) {
                    var key = baseKey(keys[i], urlKeyPrefix);
                    resultArray.push(
                        redisResponseToObject(
                            key,
                            results[3 * i], // URL
                            results[3 * i + 1], // Len
                            results[3 * i + 2] // Created
                        )
                    );
                }

                // b - a defaults ordering to most recent first.
                resultArray.sort(function(a, b) {
                    return b.createdAt - a.createdAt;
                });
                
                callback(false, resultArray);
            });
        });
    };

    return Redirect;
};
