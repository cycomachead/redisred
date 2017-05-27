/*
    Authorized Users is a set of emails that can log in.

    you can do 3 things:
    - add an email
    - remove an email
    - check if in the list
*/

const AUTHORIZATIONS = 'authorizations';

module.exports = (redis) => {
  const AuthorizedUsers = {};

  AuthorizedUsers.isAuthorized = (key, callback) => {
    redis.sismember(AUTHORIZATIONS, key, (err, result) => {
      if (err) {
        callback(err, false);
      } else if (result != 1) {
          callback(new Error('User is not authorized'), false);
      } else {
          // TODO: Return some user info?
          callback(null, true);
      }
    });
  }

  AuthorizedUsers.create = (key, callback) => {
    redis.sadd(AUTHORIZATIONS, key, (err, result) => {
      if (err) {
        callback(err, false);
      }
      
      callback(null, result)
    });
  }

  AuthorizedUsers.delete = (key, callback) => {
    redis.srem(AUTHORIZATIONS, key, (err, result) => {
      if (err) {
        callback(err, false);
      }
      
      callback(null, result)
    });
  }

  AuthorizedUsers.allAuthorizations = (callback) => {
    redis.smembers(AUTHORIZATIONS, (err, result) => {
      if (err) {
        callback(err, false);
      }
      
      callback(null, result)
    });
  }
  return AuthorizedUsers;
}
