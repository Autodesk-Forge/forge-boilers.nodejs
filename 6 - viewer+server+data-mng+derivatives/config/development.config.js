
/////////////////////////////////////////////////////////////////////
// DEVELOPMENT configuration
//
/////////////////////////////////////////////////////////////////////
const HOST_URL = 'http://localhost'

module.exports = {

  clientConfig: {

    forge: {
      token3LeggedUrl: '/api/forge/token/3legged',
      token2LeggedUrl: '/api/forge/token/2legged'
    },

    host: `${HOST_URL}`,
    port: 3000
  },

  serverConfig: {

    port: 3000,
    
    forge: {

      oauth: {

        redirectUri: `${HOST_URL}:3000/api/forge/callback/oauth`,
        authenticationUri: '/authentication/v1/authenticate',
        refreshTokenUri: '/authentication/v1/refreshtoken',
        authorizationUri: '/authentication/v1/authorize',
        accessTokenUri: '/authentication/v1/gettoken',
        baseUri: 'https://developer.api.autodesk.com',
        clientSecret: process.env.FORGE_DEV_CLIENT_SECRET,
        clientId: process.env.FORGE_DEV_CLIENT_ID,

        scope: [
          'data:read',
          'data:create',
          'data:write',
          'bucket:read',
          'bucket:create'
        ]
      }
    }
  }
}
