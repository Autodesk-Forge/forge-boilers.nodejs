
/////////////////////////////////////////////////////////////////////
// PRODUCTION configuration
//
/////////////////////////////////////////////////////////////////////
const HOST_URL = process.env.HOST_URL || 'https://oss.autodesk.io'
const PORT = 443

module.exports = {

  port: process.env.PORT,

  env: 'production',

  client: {
    // this the public host name of your server for the
    // client socket to connect.
    // eg. https://myforgeapp.mydomain.com
    readOnlyBuckets:[
      'leefsmp-temp-forge',
      'demo-bucket-emea',
      'demo-bucket-us',
      ],
    host: `${HOST_URL}`,
    env: 'production',
    port: PORT
  },

  unauthorizedFileTypes: [
    '.html'
  ],

  forge: {

    viewer: {
      viewer3D: 'https://developer.api.autodesk.com/derivativeservice/v2/viewers/viewer3D.min.js?v=v2.17',
      threeJS:  'https://developer.api.autodesk.com/derivativeservice/v2/viewers/three.min.js?v=v2.17',
      style:    'https://developer.api.autodesk.com/derivativeservice/v2/viewers/style.css?v=v2.17'
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
