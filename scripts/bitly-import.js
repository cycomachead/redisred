/*
    Use the bit.ly v3 API to grab link data.
    This will grab all links in your bit.ly account
    
    TODO: Write a real readme for this
    Go to here to get Oauth Key:
        https://bitly.com/a/oauth_apps

    Endpoints used:
    /v3/user/link_history - gets all bitlinks
    /v3/link/clicks - returns click history for each link

    Notes:
    bitly `ts` values use the Unix timeclock, and are in minutes
    All JS values should be multiplied by MILLISECONDS

    DATA:
    The returned data will be organized by short-url keys
    If there's a human-readable key, and a hash, the hash will
    be set to the `alias` field.
    When importing into redis, the human-readable key will get
    click data, but the hash won't.
    Hashes are still copied over to preserve compatibility,
    and will get the click logs if there is no human readable key.
    {
        key: {
            createdAt: 'JS datetime int',
            url: 'url',
            alias: 'hash' || null,
            clicks: [ 'datetime ints' ]
        }
    }
*/
var https = require('request');

var MILLISECONDS = 1e3;
var API_DOMAIN = 'https://api-ssl.bitly.com';
var BITLY_DOMAINS = [
    'bit.ly',
    'bitly.com',
    'j.mp'
];

function extractShortCode(url, customDomain) {
    
}

// Handle bitly's funky timestamp pagination
// Returns false if no more pages, or the URL to the next page
function nextPage(resp) {
    
}

function getBitlyData(apiToken, customURL, callback) {
    var RESULT_DATA = {},
         
}

token = 'APITOKEN1'
headers = {
  'x-access-token': token,
  'Content-Type': 'application/json',
  'Accept': 'application/json'
}

function newRedir(key, url) {
  rq.post(rr, {
    headers: headers,
    body: JSON.stringify({
      key: key,
      url: url
    })
  }, function (e, r, b) {
    //console.log('ERROR: ', e);
    console.log('REQUEST: ', r.statusCode);
    //console.log('BODY: ', b);
  })
}

bitly = JSON.parse(fs.readFileSync('bitly_2.json').toString())

count = 0
bitly.data.link_history.slice(50).forEach(function (item) {
  if (item.keyword_link) {0
    key = item.keyword_link.replace('http://bjc.link/', '')
    newRedir(key, item.long_url);
    count += 1
  }
  if (item.link) {
    // Auto generated bitly hashes. (Could be in use...)
    key = item.link.replace('http://bjc.link/', '')
    newRedir(key, item.long_url);
    count += 1;
  } else {
    console.log('WTF: ', item);
  }
})

module.exports = getBitlyData