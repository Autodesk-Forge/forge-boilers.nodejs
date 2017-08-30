/////////////////////////////////////////////////////////////////////
// PRODUCTION configuration
//
/////////////////////////////////////////////////////////////////////
const HOST_URL = process.env.HOST_URL  || 'https://dm.autodesk.io'
const PORT = 443

module.exports = {

  port:  process.env.PORT,

  env: 'production',

  port: PORT,

  client: {
    // this the public host name of your server for the
    // client socket to connect.
    // eg. https://myforgeapp.mydomain.com
    host: `${HOST_URL}`,
    env: 'production',
    port: PORT
  },

  forge: {

    viewer: {
      viewer3D: 'https://developer.api.autodesk.com/viewingservice/v1/viewers/viewer3D.min.js?v=v2.16',
      threeJS:  'https://developer.api.autodesk.com/viewingservice/v1/viewers/three.min.js?v=v2.16',
      style:    'https://developer.api.autodesk.com/viewingservice/v1/viewers/style.css?v=v2.16'
    },

    oauth: {

      redirectUri: `${HOST_URL}/api/forge/callback/oauth`,
      authenticationUri: '/authentication/v1/authenticate',
      refreshTokenUri: '/authentication/v1/refreshtoken',
      authorizationUri: '/authentication/v1/authorize',
      accessTokenUri: '/authentication/v1/gettoken',
      baseUri: 'https://developer.api.autodesk.com',
      clientSecret: process.env.FORGE_CLIENT_SECRET,
      clientId: process.env.FORGE_CLIENT_ID,

      scope: [
        'data:read',
        'data:write',
        'data:create',
        'data:search',
        'bucket:read',
        'bucket:create',
        'bucket:delete'
      ]
    }
  }
}