
/////////////////////////////////////////////////////////////////////
// PRODUCTION configuration
//
/////////////////////////////////////////////////////////////////////
module.exports = {

  port: 3000,

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
