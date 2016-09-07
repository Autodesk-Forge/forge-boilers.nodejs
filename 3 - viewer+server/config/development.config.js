
/////////////////////////////////////////////////////////////////////
// DEVELOPMENT configuration
//
/////////////////////////////////////////////////////////////////////

module.exports = {

    serverConfig: {

        port: 3000,
        
        forge: {
            oauth: {
              clientSecret: process.env.FORGE_CLIENTSECRET,
              clientId: process.env.FORGE_CLIENTID
            }
        }
    }
}
