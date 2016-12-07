
import ServiceManager from '../services/SvcManager'
import { serverConfig as config } from 'c0nfig'
import express from 'express'
import multer from 'multer'
import rimraf from 'rimraf'
import crypto from 'crypto'
import path from 'path'
import fs from 'fs'

module.exports = function() {

  var router = express.Router()

  const dir = path.resolve(__dirname,
    `../../../../TMP`)

  clean(dir)

  ///////////////////////////////////////////////////////////////////
  // start cleanup task to remove uploaded temp files
  //
  ///////////////////////////////////////////////////////////////////
  setInterval(() => {

    clean(dir, 60 * 60 * 1000)

  }, 60 * 60 * 1000)

  //////////////////////////////////////////////////////////////////////////////
  // Initialization upload
  //
  ///////////////////////////////////////////////////////////////////////////////
  var storage = multer.diskStorage({

    destination: 'TMP/',
    filename: function (req, file, cb) {
      crypto.pseudoRandomBytes(16, function (err, raw) {
        if (err) return cb(err)
        cb(null, raw.toString('hex') + path.extname(file.originalname))
      })
    }
  })

  var upload = multer({ storage: storage })

  /////////////////////////////////////////////////////////////////////////////
  // POST /upload/oss/:bucketKey
  //
  /////////////////////////////////////////////////////////////////////////////
  router.post('/oss/:bucketKey', upload.any(), async (req, res) => {

    try {

      var bucketKey = req.params.bucketKey

      var file = req.files[0]

      var objectKey = file.originalname

      var forgeSvc = ServiceManager.getService(
        'ForgeSvc');

      var token = await forgeSvc.get2LeggedToken()

      var ossSvc = ServiceManager.getService('OssSvc')

      var response = await ossSvc.putObject(
        token.access_token,
        bucketKey,
        objectKey,
        file)

      res.json(response)

    } catch (ex) {

      console.log(ex)

      res.status(ex.status || 500)
      res.json(ex)
    }
  })

  /////////////////////////////////////////////////////////////////////////////
  // POST /dm/projects/:projectId/folders/:folderId
  // Upload file to DataManagement
  //
  /////////////////////////////////////////////////////////////////////////////
  router.post('/dm/projects/:projectId/folders/:folderId',
    upload.any(), async (req, res) => {

    try {

      var projectId = req.params.projectId

      var folderId = req.params.folderId

      var file = req.files[0]

      var forgeSvc = ServiceManager.getService(
        'ForgeSvc');

      var token = await forgeSvc.get3LeggedTokenMaster(
        req.session)

      var dmSvc = ServiceManager.getService('DMSvc')

      var response = await dmSvc.upload(
        token.access_token,
        projectId,
        folderId,
        file)

      res.json(response)

    } catch (ex) {

      res.status(ex.status || 500)
      res.json(ex)
    }
  })

  return router
}

/////////////////////////////////////////////////////////////////////////////
//
//
/////////////////////////////////////////////////////////////////////////////
function clean(dir, age = 0) {
  fs.readdir(dir, (err, files) => {
    files.forEach((file) => {
      const filePath = path.join(dir, file)
      fs.stat(filePath, (err, stat) => {
        if (err) {
          return console.error(err);
        }
        const now = new Date().getTime();
        const endTime = new Date(stat.ctime).getTime() + age
        if (now > endTime) {
          return rimraf(filePath, (err) => {
            if (err) {
              return console.error(err);
            }
            console.log(`${dir} cleaned`);
          })
        }
      })
    })
  })
}