
/////////////////////////////////////////////////////////////////////
// DEVELOPMENT configuration
//
/////////////////////////////////////////////////////////////////////

module.exports = {

    serverConfig: {

        port: 3000,
        
        forge: {
            oauth: {
              clientSecret: process.env.FORGE_CLIENT_SECRET,
              clientId: process.env.FORGE_CLIENT_ID
            }
        }
    }
}
