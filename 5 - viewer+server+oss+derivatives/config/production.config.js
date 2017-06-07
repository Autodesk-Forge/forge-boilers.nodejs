
/////////////////////////////////////////////////////////////////////
// PRODUCTION configuration
//
/////////////////////////////////////////////////////////////////////
const HOST_URL = 'https://oss.autodesk.io'
const PORT = 443

module.exports = {

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
      viewer3D: 'https://autodeskviewer.com/viewers/2.14/viewer3D.min.js',
      threeJS:  'https://autodeskviewer.com/viewers/2.14/three.min.js',
      style:    'https://autodeskviewer.com/viewers/2.14/style.min.css'
    },

    oauth: {
      clientSecret: process.env.FORGE_CLIENT_SECRET,
      clientId: process.env.FORGE_CLIENT_ID,

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
