
/////////////////////////////////////////////////////////////////////
// PRODUCTION configuration
//
/////////////////////////////////////////////////////////////////////
module.exports = {

  client: {
    host: process.env.HOST_URL || 'https://dm.autodesk.io',
    port: 443
  },

  port: 3000,

  forge: {

    viewer: {
      viewer3D: 'https://autodeskviewer.com/viewers/2.14/viewer3D.min.js',
      threeJS:  'https://autodeskviewer.com/viewers/2.14/three.min.js',
      style:    'https://autodeskviewer.com/viewers/2.14/style.min.css'
    },

    oauth: {

      redirectUri: `${process.env.HOST_URL}/api/forge/callback/oauth`,
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