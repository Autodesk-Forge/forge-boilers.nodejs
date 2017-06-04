
/////////////////////////////////////////////////////////////////////
// DEVELOPMENT configuration
//
/////////////////////////////////////////////////////////////////////
module.exports = {

    port: 3000,

    forge: {

      viewer: {
        viewer3D: 'https://autodeskviewer.com/viewers/2.14/viewer3D.js',
        threeJS:  'https://autodeskviewer.com/viewers/2.14/three.js',
        style:    'https://autodeskviewer.com/viewers/2.14/style.css'
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
