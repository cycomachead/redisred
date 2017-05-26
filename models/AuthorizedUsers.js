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
      }

      callback(null, result)
    });
  }

  AuthorizedUsers.addAuthorization = (key, callback) => {
    redis.sadd(AUTHORIZATIONS, key (err, result) => {
      if (err) {
        callback(err, false);
      }
      
      callback(null, result)
    });
  }

  AuthorizedUsers.removeAuthorization = (key, callback) => {
    redis.srem(AUTHORIZATIONS, key (err, result) => {
      if (err) {
        callback(err, false);
      }
      
      callback(null, result)
    })
  }

  return AuthorizedUsers;
}
