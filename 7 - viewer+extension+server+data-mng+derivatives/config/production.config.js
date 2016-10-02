
/////////////////////////////////////////////////////////////////////
// PRODUCTION configuration
//
/////////////////////////////////////////////////////////////////////

module.exports = {

  clientConfig: {

    forge: {
      token3LeggedUrl: '/api/forge/token/3legged',
      token2LeggedUrl: '/api/forge/token/2legged'
    },

    host: process.env.HOST_URL,
    port: 443
  },

  serverConfig: {

    port: 3000,

    forge: {

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
          'data:create',
          'data:write',
          'bucket:read',
          'bucket:create'
        ]
      }
    }
  }
}