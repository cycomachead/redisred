/*
    Redirects -- Redis Model
    
*/
var urlKeyPrefix = "url_";
var clicksKeyPrefix = "clicks_";
var dateAddedPrefix = 'dateCreated_';

function createResponseObject(key, url, clicks, created) {
    return {
        key: key,
        url: url,
        clicks: clicks,
        createdAt: created
    };
};

function redisResponseToObject(key, url, clicks, dateAdd) {
    console.log('REDIS RESPONSE: ', key);
    console.log('url:  ', url);
    console.log('clicks: ', clicks);
    console.log('created:  ', dateAdd);
    
    safeCheck = (x) => x !== undefined && x.length > 1 ? x[1] : null;
    
    var resultUrl = safeCheck(url);
    var resultClicks = safeCheck(clicks);
    if (resultUrl && resultClicks) {
        return createResponseObject(
            key,
            resultUrl,
            resultClicks,
            safeCheck(dateAdd)
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
        redis.rpush(clicksKeyPrefix + key, (new Date()).valueOf());
        redis.llen(clicksKeyPrefix + key);
        redis.get(dateAddedPrefix + key);
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
        key = key.toLowerCase();
        redis.multi({
            pipeline: false
        });
        redis.set(urlKeyPrefix + key, url);
        redis.set(dateAddedPrefix + key, (new Date().valueOf()))
        redis.exec(function(err, result) {
            if (err) {
                callback(err);
                return;
            }
            callback(false, createResponseObject(key, url, []));
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
            keys.forEach(function (element) {
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
                    resultArray.push(redisResponseToObject(key, results[2 * i], results[2 * i + 1]));
                }
                // TODO: Sort on DateAdded time.
                // resultArray.sort(function(a, b) {
//                     return a.key.localeCompare(b.key);
//                 });
                callback(false, resultArray);
            });
        });
    };

    return Redirect;
};
