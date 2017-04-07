
/////////////////////////////////////////////////////////////////////
// DEVELOPMENT configuration
//
/////////////////////////////////////////////////////////////////////
module.exports = {

    port: 3000,

    forge: {

      viewer: {
        viewer3D: 'https://developer.api.autodesk.com/viewingservice/v1/viewers/viewer3D.js?v=2.14',
        threeJS:  'https://developer.api.autodesk.com/viewingservice/v1/viewers/three.js?v=2.14',
        style:    'https://developer.api.autodesk.com/viewingservice/v1/viewers/style.css?v=2.14'
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
