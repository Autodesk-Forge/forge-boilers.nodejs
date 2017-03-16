
/////////////////////////////////////////////////////////////////////
// DEVELOPMENT configuration
//
/////////////////////////////////////////////////////////////////////

module.exports = {

    clientConfig: {
      forge: {
        token2LeggedUrl: '/api/forge/token/2legged'
      }
    },

    serverConfig: {

        port: 3000,
        
        forge: {
            oauth: {
              clientSecret: process.env.FORGE_DEV_CLIENT_SECRET,
              clientId: process.env.FORGE_DEV_CLIENT_ID,

              scope: [
                'data:read',
                'data:write',
                'data:create',
                'bucket:read',
                'bucket:create',
                'bucket:delete'
              ]
            }
        }
    }
}
