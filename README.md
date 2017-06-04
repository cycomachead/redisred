# bjc.link

A small Redis-based URL Redirect. The original base for bjc.link was built from [redisred][redisred].

[redisred]: https://github.com/Detry322/redisred

[<img src="https://www.herokucdn.com/deploy/button.png">](https://www.heroku.com/deploy/?template=https://github.com/cycomachead/bjc.link)

## Features

### Everyone

* Simple redirects for named URLs.
* 404's for unfound URLs, with a link to the root page.
* Visiting just `/` brings you to a designated root redirect.

### Admins

* `/admin` brings people to page where they can sign in with Google.
* `/admin/redirects` lets people view and edit all of the redirects. 
* `/admin/users` to manage who has access to create redirects.
* Link tracking, including a visit graph, and Google Analytics support
* Edit URLs after creation
* Import from bit.ly (WIP)

### API

All requests must be authenticated with a `x-access-token` header.

* `GET /admin/api/` returns a json of all the redirects
* `POST /admin/api/create` creates a redirect with parameters `key` and `url`
* `POST /admin/api/delete` deletes a redirect with parameter `key`

## How to get up and running

Some quick easy steps:

1. Make sure you have `gcc`, `brew`, `node`, and `npm` installed.
2. Run `brew install redis`
3. Run `npm install && npm run create-config`
4. Edit the `.env` file to have the environment variables you like :)

## How to run the app locally

`npm run start` (To stop the server, `Ctrl+C`)

## Environment variables.

| Variable | Description |
| -------- | ----------- |
| PORT | The port this app should run on |
| ADMIN_EMAIL | The email of the first admin.  |
| API_TOKEN | The token to be used on all API calls |
| ROOT_REDIRECT | The URL the root of your website should redirect to |
| SESSION_SECRET | A secret key for verifying the integrity of signed cookies |


## License

Redisred is released under the MIT license.
