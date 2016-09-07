
/////////////////////////////////////////////////////////////////////
// DEVELOPMENT configuration
//
/////////////////////////////////////////////////////////////////////

module.exports = {

    clientConfig: {

      token2LeggedUrl: '/api/forge/token/2legged'
    },

    serverConfig: {

        port: 3000,
        
        forge: {
            oauth: {
              clientSecret: process.env.FORGE_CLIENTSECRET,
              clientId: process.env.FORGE_CLIENTID,

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
