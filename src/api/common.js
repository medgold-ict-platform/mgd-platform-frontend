var Amplify = require('aws-amplify');
var agent = require('superagent-promise')(require('superagent'), Promise);
var ls = require('local-storage');

var DEBUG = false;

export async function api (uri, method, params) {
  try {
    const session = await Amplify.Auth.currentSession()
    if (session) {
      if(DEBUG) console.log('checking for token' + JSON.stringify(session));
      var token = session.idToken.jwtToken;
      ls('access-token', token);

      if(DEBUG) console.log('uri ' + uri + ' params ' + JSON.stringify(params));
      if (method === 'GET') {
        const search = encodeParams(params);
        return agent(method, apiURI(`${uri}?${search}`))
          .set(header())
          .then(response => {return response})
          .catch(err => {
            throw err
          });
      }
      else {
        return agent(method, apiURI(uri))
          .send(params)
          .set(header())
          .then(response => {return response})
          .catch(err => {
            throw err
          });
        }
      }
    }
    catch (err) {
      console.log('token error ', err)
    }
  }

  export function saveToken (token) {
    ls('access-token', token);
  }

  export function clearToken() {
    ls('access-token', '');
  }

  export function setURL(url) {
    ls('endpoint-url', url)
  }

   // API EXECUTION
  function apiURI(path) {
    return `${getURL()}${path}`
  }

  function encodeParams(params) {
    return Object.keys(params).map((keyName) => {
      return encodeURIComponent(keyName) + '=' + encodeURIComponent(params[keyName]);
    })
      .join('&');
  }

  function header() {
    var header = {
      'Accept': 'application/json',
      'Content-Type': 'application/json'
    };
    if (getToken() !== undefined) {
      header['Authorization'] = getToken();
    }
    if(DEBUG) console.log("Header: " + JSON.stringify(header));
    return header;
  }

  function getToken() {
    var ret = ls('access-token');
    if (ret === null) {
      return ''
    }
    return ls('access-token');
  }

  function getURL() {
    var ret = ls('endpoint-url');
    if (ret === null) {
      console.error("-- api -> No URL endpoint set!");
      return ''
    }
    return ls('endpoint-url');
  }
