
/////////////////////////////////////////////////////////////////////
// DEVELOPMENT configuration
//
/////////////////////////////////////////////////////////////////////
const HOST_URL = 'http://localhost'
const PORT = 3000

module.exports = {

  env: 'development',

  port: PORT,

  client: {
    readOnlyBuckets:[],
    host: `${HOST_URL}`,
    env: 'development',
    port: PORT
  },

  unauthorizedFileTypes: [
    '.html'
  ],

  forge: {

    viewer: {
      viewer3D: 'https://developer.api.autodesk.com/derivativeservice/v2/viewers/viewer3D.js?v=3.3',
      threeJS:  'https://developer.api.autodesk.com/derivativeservice/v2/viewers/three.js?v=3.3',
      style:    'https://developer.api.autodesk.com/derivativeservice/v2/viewers/style.css?v=3.3'
    },

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
